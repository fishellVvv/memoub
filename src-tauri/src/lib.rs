use std::{path::PathBuf, sync::Mutex};
use tauri::{
  menu::{CheckMenuItemBuilder, MenuBuilder, MenuItemBuilder},
  tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
  AppHandle, Emitter, LogicalPosition, LogicalSize, Manager, Position, Size, WebviewUrl,
  WebviewWindowBuilder, WindowEvent,
};
use tauri_plugin_autostart::{MacosLauncher, ManagerExt};

const AUTOSTART_ARG: &str = "--autostart";
const MAIN_WINDOW_LABEL: &str = "main";
const PREVIEW_WINDOW_LABEL: &str = "tray-preview";
const TRAY_ID: &str = "main-tray";
const TRAY_OPEN_ID: &str = "tray-open";
const TRAY_AUTOSTART_ID: &str = "tray-autostart";
const TRAY_QUIT_ID: &str = "tray-quit";
const PREVIEW_SNAPSHOT_EVENT: &str = "desktop://preview-snapshot";
const PREVIEW_WINDOW_WIDTH: f64 = 320.0;
const PREVIEW_MIN_HEIGHT: f64 = 28.0;
const PREVIEW_MARGIN_X: f64 = 8.0;
const PREVIEW_MARGIN_Y: f64 = 4.0;

#[derive(Clone, Default, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct PreviewThemeSnapshot {
  background: String,
  text: String,
  muted_text: String,
  font_family: String,
  ui_scale: f64,
}

#[derive(Clone, Default, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct PreviewSnapshot {
  message: String,
  footer_line: String,
  status: String,
  theme: PreviewThemeSnapshot,
}

#[derive(Default)]
struct PreviewSnapshotStore(Mutex<PreviewSnapshot>);

fn is_autostart_launch() -> bool {
  std::env::args().any(|arg| arg == AUTOSTART_ARG)
}

fn show_main_window<R: tauri::Runtime>(app: &AppHandle<R>) {
  hide_preview_window(app);

  if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
    let _ = window.unminimize();
    let _ = window.show();
    let _ = window.set_focus();
  }
}

fn hide_main_window<R: tauri::Runtime>(app: &AppHandle<R>) {
  if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
    let _ = window.hide();
  }
}

fn hide_preview_window<R: tauri::Runtime>(app: &AppHandle<R>) {
  if let Some(window) = app.get_webview_window(PREVIEW_WINDOW_LABEL) {
    let _ = window.hide();
  }
}

fn read_preview_snapshot<R: tauri::Runtime>(app: &AppHandle<R>) -> PreviewSnapshot {
  match app.state::<PreviewSnapshotStore>().0.lock() {
    Ok(value) => value.clone(),
    Err(_) => PreviewSnapshot::default(),
  }
}

fn has_preview_content(snapshot: &PreviewSnapshot) -> bool {
  !snapshot.message.trim().is_empty() || !snapshot.footer_line.trim().is_empty()
}

fn emit_preview_snapshot<R: tauri::Runtime>(app: &AppHandle<R>, snapshot: &PreviewSnapshot) {
  let _ = app.emit_to(PREVIEW_WINDOW_LABEL, PREVIEW_SNAPSHOT_EVENT, snapshot);
}

fn preview_window_height<R: tauri::Runtime>(window: &tauri::WebviewWindow<R>) -> f64 {
  match window.inner_size() {
    Ok(size) => {
      let scale_factor = window.scale_factor().unwrap_or(1.0);
      f64::from(size.height) / scale_factor
    }
    Err(_) => 96.0,
  }
}

fn monitor_work_area_logical<R: tauri::Runtime>(
  app: &AppHandle<R>,
) -> Option<(f64, f64, f64, f64)> {
  let monitor = app.primary_monitor().ok().flatten()?;
  let scale_factor = monitor.scale_factor();
  let work_area = monitor.work_area();

  Some((
    f64::from(work_area.position.x) / scale_factor,
    f64::from(work_area.position.y) / scale_factor,
    f64::from(work_area.size.width) / scale_factor,
    f64::from(work_area.size.height) / scale_factor,
  ))
}

fn preview_window_position<R: tauri::Runtime>(app: &AppHandle<R>, preview_height: f64) -> (f64, f64) {
  match monitor_work_area_logical(app) {
    Some((work_x, work_y, work_width, work_height)) => {
      let x = (work_x + work_width - PREVIEW_WINDOW_WIDTH - PREVIEW_MARGIN_X).max(0.0);
      let y = (work_y + work_height - preview_height - PREVIEW_MARGIN_Y).max(0.0);
      (x, y)
    }
    None => (0.0, 0.0),
  }
}

fn preview_data_directory<R: tauri::Runtime>(app: &AppHandle<R>) -> Option<PathBuf> {
  app
    .path()
    .app_local_data_dir()
    .ok()
    .map(|path| path.join("tray-preview-webview-desktop"))
}

fn show_preview_window<R: tauri::Runtime>(app: &AppHandle<R>) {
  let snapshot = read_preview_snapshot(app);
  if !has_preview_content(&snapshot) {
    hide_preview_window(app);
    return;
  }

  if let Some(window) = app.get_webview_window(PREVIEW_WINDOW_LABEL) {
    emit_preview_snapshot(app, &snapshot);
    let preview_height = preview_window_height(&window);
    let (x, y) = preview_window_position(app, preview_height);

    let _ = window.set_position(Position::Logical(LogicalPosition::new(x, y)));
    let _ = window.show();
  }
}

fn build_preview_window<R: tauri::Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
  if app.get_webview_window(PREVIEW_WINDOW_LABEL).is_some() {
    return Ok(());
  }

  let preview_window = WebviewWindowBuilder::new(
    app,
    PREVIEW_WINDOW_LABEL,
    WebviewUrl::App("index.html#tray-preview".into()),
  )
  .title("memoub preview")
  .visible(false)
  .decorations(false)
  .always_on_top(true)
  .skip_taskbar(true)
  .resizable(false)
  .maximizable(false)
  .minimizable(false)
  .closable(false)
  .focusable(false)
  .transparent(true)
  .inner_size(PREVIEW_WINDOW_WIDTH, 48.0);

  let preview_window = if let Some(data_directory) = preview_data_directory(app) {
    preview_window.data_directory(data_directory).build()?
  } else {
    preview_window.build()?
  };

  let _ = preview_window.set_ignore_cursor_events(true);

  Ok(())
}

fn build_tray<R: tauri::Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
  let autostart_enabled = app.autolaunch().is_enabled().unwrap_or(false);
  let open_item = MenuItemBuilder::with_id(TRAY_OPEN_ID, "Open memoub").build(app)?;
  let autostart_item = CheckMenuItemBuilder::with_id(TRAY_AUTOSTART_ID, "Iniciar con Windows")
    .checked(autostart_enabled)
    .build(app)?;
  let quit_item = MenuItemBuilder::with_id(TRAY_QUIT_ID, "Quit memoub").build(app)?;
  let tray_menu = MenuBuilder::new(app)
    .item(&open_item)
    .item(&autostart_item)
    .separator()
    .item(&quit_item)
    .build()?;

  let autostart_item_handle = autostart_item.clone();
  let mut tray_builder = TrayIconBuilder::with_id(TRAY_ID)
    .menu(&tray_menu)
    .show_menu_on_left_click(false)
    .on_menu_event(move |app, event| match event.id().as_ref() {
      TRAY_OPEN_ID => show_main_window(app),
      TRAY_AUTOSTART_ID => {
        let should_enable = autostart_item_handle.is_checked().unwrap_or(false);
        let _ = if should_enable {
          app.autolaunch().enable()
        } else {
          app.autolaunch().disable()
        };

        let is_enabled = app.autolaunch().is_enabled().unwrap_or(should_enable);
        let _ = autostart_item_handle.set_checked(is_enabled);
      }
      TRAY_QUIT_ID => {
        hide_preview_window(app);
        app.exit(0);
      }
      _ => {}
    })
    .on_tray_icon_event(|tray, event| match event {
      TrayIconEvent::Click {
        button: MouseButton::Left,
        button_state: MouseButtonState::Up,
        ..
      } => {
        show_main_window(&tray.app_handle());
      }
      TrayIconEvent::Enter { .. } => {
        show_preview_window(&tray.app_handle());
      }
      TrayIconEvent::Leave { .. } => {
        hide_preview_window(&tray.app_handle());
      }
      TrayIconEvent::Click {
        button: MouseButton::Right,
        ..
      } => {
        hide_preview_window(&tray.app_handle());
      }
      _ => {}
    });

  if let Some(icon) = app.default_window_icon().cloned() {
    tray_builder = tray_builder.icon(icon);
  }

  tray_builder.build(app)?;
  Ok(())
}

fn wire_main_window_behavior<R: tauri::Runtime>(app: &AppHandle<R>) {
  if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
    let app_handle = app.clone();
    window.on_window_event(move |event| {
      if let WindowEvent::CloseRequested { api, .. } = event {
        api.prevent_close();
        hide_main_window(&app_handle);
      }
    });
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let mut builder = tauri::Builder::default();

  #[cfg(desktop)]
  {
    builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
      show_main_window(app);
    }));
  }

  builder = builder
    .plugin(tauri_plugin_store::Builder::new().build())
    .plugin(tauri_plugin_autostart::init(
      MacosLauncher::LaunchAgent,
      Some(vec![AUTOSTART_ARG]),
    ));

  if cfg!(debug_assertions) {
    builder = builder.plugin(
      tauri_plugin_log::Builder::default()
        .level(log::LevelFilter::Info)
        .build(),
    );
  }

  builder
    .manage(PreviewSnapshotStore::default())
    .invoke_handler(tauri::generate_handler![
      sync_preview_window,
      update_preview_snapshot,
      get_preview_snapshot
    ])
    .setup(|app| {
      if let Ok(enabled) = app.autolaunch().is_enabled() {
        if !enabled {
          let _ = app.autolaunch().enable();
        }
      }

      build_preview_window(app.handle())?;
      build_tray(app.handle())?;
      wire_main_window_behavior(app.handle());

      if is_autostart_launch() {
        hide_main_window(app.handle());
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn sync_preview_window(app: AppHandle, height: f64) {
  if let Some(window) = app.get_webview_window(PREVIEW_WINDOW_LABEL) {
    let next_height = height.max(PREVIEW_MIN_HEIGHT);

    let _ = window.set_size(Size::Logical(LogicalSize::new(PREVIEW_WINDOW_WIDTH, next_height)));
    let (x, y) = preview_window_position(&app, next_height);

    let _ = window.set_position(Position::Logical(LogicalPosition::new(x, y)));
  }
}

#[tauri::command]
fn update_preview_snapshot(
  app: AppHandle,
  store: tauri::State<PreviewSnapshotStore>,
  snapshot: PreviewSnapshot,
) {
  if let Ok(mut value) = store.0.lock() {
    *value = snapshot.clone();
  }

  emit_preview_snapshot(&app, &snapshot);
}

#[tauri::command]
fn get_preview_snapshot(
  store: tauri::State<PreviewSnapshotStore>,
) -> PreviewSnapshot {
  match store.0.lock() {
    Ok(value) => value.clone(),
    Err(_) => PreviewSnapshot::default(),
  }
}
