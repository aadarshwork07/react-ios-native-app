#import <Foundation/Foundation.h>
#import <React/RCTBridge.h>

@interface HealthKitHelper : NSObject
+ (void)initializeBackgroundObserversWithBridge:(RCTBridge *)bridge;
@end