import ExpoModulesCore

public final class OhangLiquidGlassModule: Module {
  public func definition() -> ModuleDefinition {
    Name("OhangLiquidGlass")

    View(OhangLiquidGlassView.self) {
      Prop("glassStyle") { (view, style: String?) in
        view.glassStyle = style ?? "regular"
      }

      Prop("interactive") { (view, interactive: Bool?) in
        view.isGlassInteractive = interactive ?? true
      }

      Prop("tintColor") { (view, tintColor: String?) in
        view.tintColorHex = tintColor
      }

      Prop("cornerRadius") { (view, cornerRadius: Double?) in
        view.cornerRadius = cornerRadius ?? 24
      }
    }
  }
}
