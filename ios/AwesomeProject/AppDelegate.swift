import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: RCTAppDelegate {
  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    self.moduleName = "AwesomeProject"
    self.dependencyProvider = RCTAppDependencyProvider()

    // You can add your custom initial props in the dictionary below.
    // They will be passed down to the ViewController used by React Native.
    self.initialProps = [:]

    let result = super.application(application, didFinishLaunchingWithOptions: launchOptions)
    
    // Initialize HealthKit background observers using Objective-C runtime
    if let bridge = self.bridge {
      if let healthKitClass = NSClassFromString("RCTAppleHealthKit") {
        let healthKit = healthKitClass.alloc() as AnyObject
        let selector = NSSelectorFromString("initializeBackgroundObservers:")
        if healthKit.responds(to: selector) {
          healthKit.perform(selector, with: bridge)
          print("HealthKit background observers initialized successfully")
        } else {
          print("HealthKit initialize method not found")
        }
      } else {
        print("RCTAppleHealthKit class not found")
      }
    }

    return result
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    return self.bundleURL()
  }

  override func bundleURL() -> URL? {
    #if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }
}