#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        if (argc < 4) {
            printf("Usage: muxer <video_path> <audio_path> <output_path>\n");
            return 1;
        }
        NSString *videoPath = [NSString stringWithUTF8String:argv[1]];
        NSString *audioPath = [NSString stringWithUTF8String:argv[2]];
        NSString *outputPath = [NSString stringWithUTF8String:argv[3]];

        NSURL *videoURL = [NSURL fileURLWithPath:videoPath];
        NSURL *audioURL = [NSURL fileURLWithPath:audioPath];
        NSURL *outputURL = [NSURL fileURLWithPath:outputPath];

        [[NSFileManager defaultManager] removeItemAtURL:outputURL error:nil];

        AVMutableComposition *composition = [AVMutableComposition composition];

        AVURLAsset *videoAsset = [AVURLAsset URLAssetWithURL:videoURL options:nil];
        AVURLAsset *audioAsset = [AVURLAsset URLAssetWithURL:audioURL options:nil];

        NSArray *videoTracks = [videoAsset tracksWithMediaType:AVMediaTypeVideo];
        if ([videoTracks count] == 0) {
            NSLog(@"No video track found in %@", videoPath);
            return 1;
        }
        AVAssetTrack *videoTrack = videoTracks[0];

        NSArray *audioTracks = [audioAsset tracksWithMediaType:AVMediaTypeAudio];
        if ([audioTracks count] == 0) {
            NSLog(@"No audio track found in %@", audioPath);
            return 1;
        }
        AVAssetTrack *audioTrack = audioTracks[0];

        AVMutableCompositionTrack *compVideoTrack = [composition addMutableTrackWithMediaType:AVMediaTypeVideo preferredTrackID:kCMPersistentTrackID_Invalid];
        AVMutableCompositionTrack *compAudioTrack = [composition addMutableTrackWithMediaType:AVMediaTypeAudio preferredTrackID:kCMPersistentTrackID_Invalid];

        CMTime duration = videoTrack.timeRange.duration;
        NSError *error = nil;

        [compVideoTrack insertTimeRange:CMTimeRangeMake(kCMTimeZero, duration) ofTrack:videoTrack atTime:kCMTimeZero error:&error];
        if (error) {
            NSLog(@"Error inserting video track: %@", error);
            return 1;
        }

        CMTime audioDuration = audioTrack.timeRange.duration;
        CMTime minDuration = CMTimeCompare(duration, audioDuration) < 0 ? duration : audioDuration;

        [compAudioTrack insertTimeRange:CMTimeRangeMake(kCMTimeZero, minDuration) ofTrack:audioTrack atTime:kCMTimeZero error:&error];
        if (error) {
            NSLog(@"Error inserting audio track: %@", error);
            return 1;
        }

        compVideoTrack.preferredTransform = videoTrack.preferredTransform;

        AVAssetExportSession *exportSession = [[AVAssetExportSession alloc] initWithAsset:composition presetName:AVAssetExportPresetHighestQuality];
        exportSession.outputURL = outputURL;
        exportSession.outputFileType = AVFileTypeMPEG4;
        exportSession.shouldOptimizeForNetworkUse = YES;

        dispatch_semaphore_t sema = dispatch_semaphore_create(0);
        [exportSession exportAsynchronouslyWithCompletionHandler:^{
            dispatch_semaphore_signal(sema);
        }];
        dispatch_semaphore_wait(sema, DISPATCH_TIME_FOREVER);

        if (exportSession.status == AVAssetExportSessionStatusCompleted) {
            NSLog(@"Successfully exported muxed video to %@", outputPath);
            return 0;
        } else {
            NSLog(@"Export failed: %@", exportSession.error);
            return 1;
        }
    }
}
