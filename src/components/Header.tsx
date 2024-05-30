import {Animated, I18nManager, Image, Text, TouchableOpacity, View} from 'react-native';
import styles from '../styles/styles';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNRestart from 'react-native-restart';

interface HeaderProps {
  cartItem: number;
  animatedValue: Animated.Value;
}

const Header: React.FC<HeaderProps> = ({cartItem,animatedValue}) => {
  const [language, setLanguage] = useState<string>('en');
  useEffect(() => {
    const getLanguage = async () => {
      const lang = await AsyncStorage.getItem('language');
      console.log('lang', lang);
      setLanguage(lang || 'en');
      if (lang) {
        I18nManager.forceRTL(lang === 'ar');
        // Restart the app to apply RTL changes
        if (I18nManager.isRTL !== (lang === 'ar')) {
          I18nManager.allowRTL(lang === 'ar');
          I18nManager.forceRTL(lang === 'ar');
          // Reload the app to apply changes
          setTimeout(() => {
            RNRestart.restart();
          }, 500);
        }
      }
    };
    getLanguage();
  }, []);

  const toggleLanguage = async () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
    I18nManager.forceRTL(newLanguage === 'ar');
    await AsyncStorage.setItem('language', newLanguage);
    // Restart the app to apply RTL changes
    if (I18nManager.isRTL !== (newLanguage === 'ar')) {
      I18nManager.allowRTL(newLanguage === 'ar');
      I18nManager.forceRTL(newLanguage === 'ar');
      // Reload the app to apply changes
      setTimeout(() => {
        RNRestart.restart();
      }, 500);
    }
  };

  const animatedStyle = {
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.5],
        }),
      },
    ],
  };

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={toggleLanguage}>
        <Text style={styles.language}>{language === 'en' ? 'AR' : 'EN'}</Text>
      </TouchableOpacity>
      <Text style={styles.titleText}>{'Home'}</Text>
      <Animated.View style={animatedStyle}>
        <Image style={styles.cartIcon} source={require('../icons/cart.png')} />
        {cartItem > 0 && (
          <View style={styles.cartCount}>
            <Text style={styles.cartCountText}>{cartItem}</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

export default Header;
