Pod::Spec.new do |s|
  s.name           = 'OhangLiquidGlass'
  s.version        = '0.1.0'
  s.summary        = 'Local Expo module for testing iOS Liquid Glass.'
  s.description    = 'A local Expo module that renders an iOS Liquid Glass native view.'
  s.author         = 'Haesu Youn'
  s.homepage       = 'https://github.com/Haesus/react-native-study'
  s.license        = 'MIT'
  s.platforms      = { :ios => '15.1' }
  s.source         = { :git => 'https://github.com/Haesus/react-native-study.git' }
  s.swift_version  = '5.9'
  s.source_files   = 'ios/**/*.{h,m,mm,swift}'
  s.dependency 'ExpoModulesCore'
end
