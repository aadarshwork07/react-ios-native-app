#import <Foundation/Foundation.h>
#import <React/RCTBridge.h>
#import "RCTAppleHealthKit.h"

@interface HealthKitHelper : NSObject
@end

@implementation HealthKitHelper

+ (void)initializeBackgroundObserversWithBridge:(RCTBridge *)bridge {
  [[RCTAppleHealthKit new] initializeBackgroundObservers:bridge];
}

@end