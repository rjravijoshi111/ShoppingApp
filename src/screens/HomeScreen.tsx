// src/screens/HomeScreen.tsx
import React, {useEffect, useState, useContext, useRef} from 'react';
import {
  View,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Easing,
  UIManager,
  findNodeHandle,
  I18nManager,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {CartContext} from '../context/CartContext';
import ProductItem from '../components/ProductItem';
import styles from '../styles/styles';
import Header from '../components/Header';
import ImageSlider from '../components/ImageSlider';
import CONSTANT from '../constant/constant';

const {width: deviceWidth} = Dimensions.get('screen');

interface Product {
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

const HomeScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const {state, dispatch} = useContext(CartContext);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<number>(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [animatedValue] = useState(new Animated.Value(0));
  const animationValues = useRef([]);
  const opacityValues = useRef([]);
  const scaleValues = useRef([]);
  const [clonedProduct, setClonedProduct] = useState(null);
  const [clonedProductStyle, setClonedProductStyle] = useState({});

  useEffect(() => {
    setCartItems(state.items.length);
  }, [state]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      const lang = (await AsyncStorage.getItem('language')) || 'en';
      if (lang === 'ar') {
        I18nManager.forceRTL(true);
      }

      const response = await axios.get(
        `${CONSTANT.BASE_URL}${CONSTANT.PRODUCT_LIST}${lang}`,
      );
      const newProducts = response.data.data.products.slice(
        (page - 1) * 4,
        page * 4,
      );
      setProducts(prevProducts => [...prevProducts, ...newProducts]);
      const mergedData = [...products, ...newProducts];
      animationValues.current = mergedData.map(
        () => new Animated.ValueXY({x: 0, y: 0}),
      );
      opacityValues.current = mergedData.map(() => new Animated.Value(1));
      scaleValues.current = mergedData.map(() => new Animated.Value(1));

      setLoading(false);
    };
    fetchProducts();
  }, [page]);

  const handleAddToCart = (product: Product, index: Number, layout: any) => {
    delete product.ref;
    dispatch({type: 'ADD_TO_CART', payload: product});

    // Get the initial position of the product
    const {x, y, width, height} = layout;
    const directionMultiplier = I18nManager.isRTL ? -1 : 1;

    setClonedProductStyle({
      left: I18nManager.isRTL ? deviceWidth - x - width : x,
      top: y,
      width: width,
      height: height,
    });
    // Clone the product for animation
    setClonedProduct({...product, index});

    const xOffset = directionMultiplier * (300 - x);
    const yOffset = -y - 50;

    // Start animation sequence
    Animated.sequence([
      // Make the snap appear
      Animated.timing(opacityValues.current[index], {
        toValue: 1,
        duration: 0,
        useNativeDriver: true,
      }),
      // Shrink the product in place
      Animated.timing(scaleValues.current[index], {
        toValue: 0.5,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      // Move it to the top right corner
      Animated.parallel([
        Animated.timing(animationValues.current[index], {
          toValue: {x: xOffset, y: yOffset}, // Adjust these values as needed
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityValues.current[index], {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      animationValues.current[index].setValue({x: 0, y: 0});
      opacityValues.current[index].setValue(1);
      scaleValues.current[index].setValue(1);
      setClonedProduct(null);
    });
  };

  const measureItem = (item, product, index) => {
    const handle = findNodeHandle(item);
    UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
      handleAddToCart({...product}, index, {x: pageX, y: pageY, width, height});
    });
  };

  return (
    <SafeAreaView style={styles.topContainer}>
      <View style={styles.container}>
        <Header cartItem={cartItems} animatedValue={animatedValue} />
        <FlatList
          data={products}
          contentContainerStyle={styles.list}
          renderItem={({item, index}) => {
            return (
              <View
                style={styles.productContainer}
                ref={ref => {
                  item.ref = ref;
                }}>
                <ProductItem
                  product={item}
                  onAddToCart={product => measureItem(item.ref, product, index)}
                  onProductClick={productItem => {
                    let selectedProduct = [];
                    selectedProduct.push(productItem);
                    const imageArray = Object.values(selectedProduct[0]);
                    setSelectedProduct(imageArray);
                    setIsModalVisible(true);
                  }}
                  isAnimated={true}
                />
              </View>
            );
          }}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          onEndReached={() => {
            if (!loading && products.length < 16) {
              setPage(page + 1);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? <ActivityIndicator size="large" color="#E70028" /> : null
          }
        />
        {clonedProduct && (
          <Animated.View
            style={[
              styles.animatedProduct,
              clonedProductStyle,
              {
                transform: [
                  ...(animationValues.current[clonedProduct.index]
                    ? animationValues.current[
                        clonedProduct.index
                      ]?.getTranslateTransform()
                    : []),
                  {scale: scaleValues.current[clonedProduct.index] || 1},
                ],
                opacity: opacityValues.current[clonedProduct.index] || 1,
              },
            ]}>
            <ProductItem
              product={clonedProduct}
              onAddToCart={() => {}}
              onProductClick={() => {}}
              isAnimated={false}
            />
          </Animated.View>
        )}
        <ImageSlider
          images={selectedProduct}
          isModalVisible={isModalVisible}
          onCloseModal={() => {
            setIsModalVisible(false);
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
