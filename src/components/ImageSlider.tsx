import {
  FlatList,
  Image,
  Modal,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import styles from '../styles/styles';

const ImageSlider = ({
  images,
  isModalVisible,
  onCloseModal,
}: {
  images: any;
  isModalVisible: boolean;
  onCloseModal: () => void;
}) => {
  const renderItem = ({item, index}: {item: string; index: number}) => {
    return (
      <Image
        source={{uri: item}}
        style={styles.imageItem}
      />
    );
  };

  return (
    <Modal
      animationType={'fade'}
      transparent={true}
      visible={isModalVisible}
      statusBarTranslucent
      onRequestClose={onCloseModal}>
      <View style={styles.modalBackground}>
        <FlatList
          data={images}
          contentContainerStyle={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
          horizontal
          pagingEnabled
        />
        <TouchableOpacity
          activeOpacity={1}
          onPress={onCloseModal}
          style={styles.closeButton}>
          <Text style={styles.closeButtonText}>{'+'}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ImageSlider;
