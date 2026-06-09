import ExpoModulesCore
import UIKit

public final class OhangLiquidGlassView: ExpoView {
  private let effectView = UIVisualEffectView()
  private let contentOverlay = UIView()

  var glassStyle = "regular" {
    didSet {
      applyEffect()
    }
  }

  var isGlassInteractive = true {
    didSet {
      applyEffect()
    }
  }

  var tintColorHex: String? {
    didSet {
      applyEffect()
    }
  }

  var cornerRadius: Double = 24 {
    didSet {
      layer.cornerRadius = cornerRadius
      effectView.layer.cornerRadius = cornerRadius
      contentOverlay.layer.cornerRadius = cornerRadius
    }
  }

  public required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)

    clipsToBounds = true
    layer.cornerRadius = cornerRadius
    backgroundColor = .clear

    effectView.translatesAutoresizingMaskIntoConstraints = false
    effectView.clipsToBounds = true
    effectView.layer.cornerRadius = cornerRadius
    addSubview(effectView)

    contentOverlay.translatesAutoresizingMaskIntoConstraints = false
    contentOverlay.clipsToBounds = true
    contentOverlay.layer.cornerRadius = cornerRadius
    contentOverlay.isUserInteractionEnabled = false
    addSubview(contentOverlay)

    NSLayoutConstraint.activate([
      effectView.leadingAnchor.constraint(equalTo: leadingAnchor),
      effectView.trailingAnchor.constraint(equalTo: trailingAnchor),
      effectView.topAnchor.constraint(equalTo: topAnchor),
      effectView.bottomAnchor.constraint(equalTo: bottomAnchor),
      contentOverlay.leadingAnchor.constraint(equalTo: leadingAnchor),
      contentOverlay.trailingAnchor.constraint(equalTo: trailingAnchor),
      contentOverlay.topAnchor.constraint(equalTo: topAnchor),
      contentOverlay.bottomAnchor.constraint(equalTo: bottomAnchor)
    ])

    applyEffect()
  }

  private func applyEffect() {
    if #available(iOS 26.0, *) {
      let effect = UIGlassEffect(style: resolvedGlassStyle())
      effect.isInteractive = isGlassInteractive
      effect.tintColor = UIColor(hexString: tintColorHex)
      effectView.effect = effect
      contentOverlay.backgroundColor = resolvedOverlayColor()
    } else {
      effectView.effect = UIBlurEffect(style: .systemUltraThinMaterial)
      contentOverlay.backgroundColor =
        UIColor(hexString: tintColorHex)?.withAlphaComponent(0.18) ?? UIColor.white.withAlphaComponent(0.12)
    }
  }

  @available(iOS 26.0, *)
  private func resolvedGlassStyle() -> UIGlassEffect.Style {
    switch glassStyle {
    case "clear":
      return .clear
    default:
      return .regular
    }
  }

  private func resolvedOverlayColor() -> UIColor {
    let baseColor = UIColor(hexString: tintColorHex) ?? UIColor.white

    switch glassStyle {
    case "prominent":
      return baseColor.withAlphaComponent(0.16)
    case "clear":
      return baseColor.withAlphaComponent(0.04)
    default:
      return baseColor.withAlphaComponent(0.08)
    }
  }
}

private extension UIColor {
  convenience init?(hexString: String?) {
    guard let hexString else {
      return nil
    }

    let trimmedHex = hexString
      .trimmingCharacters(in: .whitespacesAndNewlines)
      .replacingOccurrences(of: "#", with: "")

    guard trimmedHex.count == 6 || trimmedHex.count == 8 else {
      return nil
    }

    var colorValue: UInt64 = 0
    guard Scanner(string: trimmedHex).scanHexInt64(&colorValue) else {
      return nil
    }

    let red: CGFloat
    let green: CGFloat
    let blue: CGFloat
    let alpha: CGFloat

    if trimmedHex.count == 8 {
      red = CGFloat((colorValue & 0xff000000) >> 24) / 255
      green = CGFloat((colorValue & 0x00ff0000) >> 16) / 255
      blue = CGFloat((colorValue & 0x0000ff00) >> 8) / 255
      alpha = CGFloat(colorValue & 0x000000ff) / 255
    } else {
      red = CGFloat((colorValue & 0xff0000) >> 16) / 255
      green = CGFloat((colorValue & 0x00ff00) >> 8) / 255
      blue = CGFloat(colorValue & 0x0000ff) / 255
      alpha = 1
    }

    self.init(red: red, green: green, blue: blue, alpha: alpha)
  }
}
