// Product item component
import React, {useEffect, useRef} from 'react';
import {Animated, Image, Text, TouchableOpacity, View} from 'react-native';
import styles from '../styles/styles';
import FastImage from 'react-native-fast-image';

interface ProductItemProps {
  id: number;
  title: string;
  images: {
    [key: string]: string;
  };
  currency: string;
  price_min: number;
  compare_at_price_min: number;
  tags: string[];
  'offer-message': string;
}

interface Product {
  product: ProductItemProps;
  onAddToCart: (product: ProductItemProps) => void;
  onProductClick: (product: ProductItemProps) => void;
  isAnimated: boolean;
}

const ProductItem = React.memo(
  ({product, onAddToCart, onProductClick, isAnimated}: Product) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000, // You can adjust the duration as per your preference
        useNativeDriver: true,
      }).start();
    }, []);

    const renderProductItem = () => {
      return (
        <TouchableOpacity
          onPress={() => onProductClick(product?.images)}
          key={product.id}
          style={styles.itemContainer}>
          <FastImage
            source={{uri: product.images[1]}}
            style={styles.imageContainer}
          />
          <TouchableOpacity
            onPress={() => onAddToCart(product)}
            style={styles.shoppingIconContainer}>
            <Image
              style={styles.shoppingIcon}
              source={require('../icons/shopping.png')}
            />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {product.title}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.currencyText}>{product.currency}</Text>
            <Text style={styles.priceText}>{product.price_min}</Text>
            <Text style={styles.comparePriceText}>
              {product.compare_at_price_min}
            </Text>
          </View>
          <View style={styles.offerContainer}>
            <Image
              style={styles.offerIcon}
              source={require('../icons/offer.png')}
            />
            <Text style={styles.offerText}>{product['offer-message']}</Text>
          </View>
        </TouchableOpacity>
      );
    };
    if (!isAnimated) {
      renderProductItem();
    }

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        }}>
        {renderProductItem()}
      </Animated.View>
    );
  },
);

export default ProductItem;
