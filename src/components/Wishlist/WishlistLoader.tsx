import { useEffect } from 'react';
import { setWishlistItems } from '@/redux/features/wishlist-slice';
import { useDispatch } from 'react-redux';

const WishlistLoader = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedItems = localStorage.getItem('wishlistItems');
      if (storedItems) {
        dispatch(setWishlistItems(JSON.parse(storedItems)));
      }
    }
  }, [dispatch]);

  return null;
};

export default WishlistLoader;
