import React, { useState } from 'react';
import { View, StyleSheet, Modal,Platform,Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Header } from './components/Header';
import Progress from './components/Progress';
import { colors } from './res';
const BeautyWebView = ({
  visible,
  onPressClose,
  backgroundColor,
  headerContent, // 'dark' || 'light', default 'dark'
  headerBackground, // default #fff
  url, // Required
  progressColor,
  progressHeight,
  loadingText,
  copyLinkTitle,
  openBrowserTitle,
  extraMenuItems,
  animationType,
  progressBarType, // 'normal' || 'background'
  onLoadEnd,
  onLoadStart,
  navigationVisible,
  closeIcon,
  menuIcon,
  onGoBack,
  onGoForward
}) => {
  const [progressRef, setProgressRef] = useState(null);
  const [backgroundProgressRef, setBackgroundProgressRef] = useState(null);
  const [title, setTitle] = useState(loadingText);
  const [backQueue, setBackQueue] = useState([]);
  const [forwardQueue, setForwardQueue] = useState([]);
  const [currentUrl, setCurrentUrl] = useState(url);

  const onProgress = (progress) => {
    progressRef?.startAnimation(progress);
    progressBarType === 'background' && backgroundProgressRef?.startAnimation(progress);
  };

  const onNavigationStateChange = (event) => {
    if (currentUrl === event.url) return;
    backQueue.push(currentUrl);
    setBackQueue(backQueue);
    onGoForward && onGoForward();
    setCurrentUrl(event.url);
  }

  const onPressBack = () => {
    if (backQueue.length == 0) return;
    const newUrl = backQueue[backQueue.length - 1];
    forwardQueue.push(currentUrl);
    setForwardQueue(forwardQueue);
    onGoBack && onGoBack();
    backQueue.pop();
    setBackQueue(backQueue);
    setCurrentUrl(newUrl);
  }

  const onPressForward = () => {
    if (forwardQueue.length == 0) return;
    const newUrl = forwardQueue[forwardQueue.length - 1];
    backQueue.push(currentUrl);
    setBackQueue(backQueue);
    forwardQueue.pop();
    setForwardQueue(forwardQueue);
    setCurrentUrl(newUrl);
    onGoForward && onGoForward();
  }

  const onClose = () => {
    onPressClose && onPressClose();
    setTimeout(() => {
      setBackQueue([]);
      setForwardQueue([]);
      setCurrentUrl(url);
    }, 200);
  } 
  


  return (
    <Modal visible={visible} transparent={false} animationType={animationType}>
      <View style={[styles.container, { backgroundColor: backgroundColor }]}>
        <Header
          backgroundColor={headerBackground}
          contentType={headerContent}
          title={title}
          url={currentUrl}
          onPressClose={onClose}
          copyLinkTitle={copyLinkTitle}
          openBrowserTitle={openBrowserTitle}
          extraMenuItems={extraMenuItems}
          backgroundProgressRefOnChange={setBackgroundProgressRef}
          navigationVisible={navigationVisible}
          canForward={forwardQueue.length > 0}
          canback={backQueue.length > 0}
          onPressBack={onPressBack}
          onPressForward={onPressForward}
          closeIcon={closeIcon}
          menuIcon={menuIcon}
        />
        {
          progressBarType === 'normal' &&
          <Progress
            height={progressHeight}
            color={progressColor}
            ref={(progress) => setProgressRef(progress)}
          />
        }
        <WebView
          source={{ uri: currentUrl }}
          onLoadProgress={({ nativeEvent }) => {
            let loadingProgress = nativeEvent.progress;
            onProgress(loadingProgress);
          }}
          injectedJavaScript="window.ReactNativeWebView.postMessage(document.title)"
          onMessage={event => setTitle(event.nativeEvent.data)}
          onLoadEnd={onLoadEnd}
          onLoadStart={onLoadStart}
          onNavigationStateChange={onNavigationStateChange}
        />
      </View>
    </Modal>
  );
};
const dim = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    paddingTop:Platform.OS ==='ios' && ( dim.height == 812 || dim.width == 812 || dim.height == 896 || dim.width == 896) ? 50: (Platform.OS==='ios' ? 10: 0),
    flex: 1,
    alignSelf: 'stretch',
  },
});

BeautyWebView.defaultProps = {
  transparent: true,
  backgroundColor: colors.defaultBackground,
  headerContent: 'dark',
  headerBackground: colors.defaultBackground,
  progressColor: colors.progress,
  progressHeight: 4,
  loadingText: 'Loading...',
  copyLinkTitle: 'Copy Link',
  openBrowserTitle: 'Open on Browser',
  animationType: "slide",
  progressBarType: "normal",
  navigationVisible: true
}

export default BeautyWebView;
