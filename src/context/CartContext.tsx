import React, {createContext, useReducer, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Product {
  id: string;
  name: string;
  images: string[];
  // Add other properties as per your API response
}

interface CartState {
  items: Product[];
}

interface CartAction {
  type: 'ADD_TO_CART' | 'REMOVE_FROM_CART' | 'SET_CART';
  payload: Product | Product[];
}

const initialState: CartState = {
  items: [],
};

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
}>({
  state: initialState,
  dispatch: () => undefined,
});

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART':
      return {...state, items: [...state.items, action.payload as Product]};
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(
          item => item.id !== (action.payload as Product).id,
        ),
      };
    case 'SET_CART':
      return {
        ...state,
        items: Array.isArray(action.payload) ? action.payload : [],
      };
    default:
      return state;
  }
};

const CartProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    const loadCart = async () => {
      const cartData = await AsyncStorage.getItem('cart');
      if (cartData) {
        dispatch({type: 'SET_CART', payload: JSON.parse(cartData)});
      }
    };
    loadCart();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  return (
    <CartContext.Provider value={{state, dispatch}}>
      {children}
    </CartContext.Provider>
  );
};

export {CartContext, CartProvider};
