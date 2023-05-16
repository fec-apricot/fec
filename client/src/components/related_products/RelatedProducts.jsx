import React, {
  useState,
  useEffect,
  useContext,
  useRef,
} from 'react';
import { GlobalContext } from '../GlobalContext.jsx';
import Carousel from './carousel/Carousel.jsx';
import parse from '../../parse';
import './Related.css';

function RelatedProducts() {
  const { productID } = useContext(GlobalContext);
  const [dataStore, setDataStore] = useState({});
  const [related, setRelated] = useState([]);
  const [outfitList, setOutfitList] = useState([]);
  const [burn, setBurn] = useState(0);

  const allProducts = useRef({});

  const addBlanksToOutfit = (list) => {
    while (list.indexOf(10001) !== -1) {
      const index = list.indexOf(10001);
      list.splice(index, 1);
    }
    if (list.length < 3) {
      for (let i = list.length; i < 3; i += 1) {
        list.push(10001); // blank product
      }
    }
    // console.log('new list^^^^^^^', list);
    return list;
  };

  const outfitToggle = () => {
    const oList = [...outfitList];
    // console.log('original outfit', oList);
    const index = oList.indexOf(productID);
    if (index === -1) {
      setOutfitList(addBlanksToOutfit([productID, ...oList]));
    } else {
      oList.splice(index, 1);
      setOutfitList(addBlanksToOutfit(oList));
    }
    // console.log('((((((((((((((-------outfitList has been set: ', oList);
    // setBurn(productID + burn);
  };

  const searchAllProducts = (id) => {
    // console.log('-------> STEP 2 check if related id info already stored', id);
    // console.log('!!!!checking allProducts for id: ', id, allProducts);
    let pass = true;
    if (allProducts.current[id] === undefined) {
      // console.log('not in there', id, allProducts.current);
      pass = false;
      return pass;
    }
    // console.log('id found!', id, allProducts.current);
    return pass;
  };

  const infoRequester = async (id) => {
    const endpoints = [
      `/products/${id}`,
      `/products/${id}/styles`,
      `/reviews/meta?product_id=${id}`,
    ];
    // console.log('-------> STEP 3 request info for:', id);
    await Promise.all(endpoints.map((endpoint) => parse.get(endpoint)))
      .then((res) => {
        allProducts.current[id] = res;
        // console.log('Data received for id; ', id, res, ' has been stored in allProducts', allProducts.current);
        setDataStore(allProducts.current);
        // console.log('-------> STEP 4 store received info for:', id, allProducts.current);
      })
      .catch((err) => {
        console.log('promise.all err', err);
      });
    // console.log('request END!!!!!<-------id:', id);
    setBurn(id);
  };

  useEffect(() => {
    related.forEach((id) => {
      if (id === undefined) { return; }
      if (searchAllProducts(id)) {
        // console.log('req avoided');
        // setProducts(allProducts.current);
        return;
      }
      if (id !== 10001) {
        infoRequester(id);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [related]);

  useEffect(() => {
    // console.log('-------> STEP 1 request ids related to ', productID);
    parse
      .get(`/products/${productID}/related`)
      .then((res) => {
        const noDuplicate = [];
        res.forEach((idNum) => {
          if (noDuplicate.indexOf(idNum) === -1) {
            noDuplicate.push(idNum);
          }
        });
        // console.log('this is the related res: ', res);
        // console.log('no duplicates ++++++++++++++++++', noDuplicate);
        setRelated(noDuplicate);
      })
      .catch((err) => {
        console.log('RP Carousel GET err', err);
      });
  }, [productID]);

  useEffect(() => {
    setRelated([productID]);
    let oList = [...outfitList];
    oList = addBlanksToOutfit(oList);
    setOutfitList(oList);

    const blankInfo = {
      name: 'Blank',
      slogan: 'add products!!!',
      category: 'Category',
      default_price: '$$',
    };
    const blankStyles = {
      results: [{
        photos: [{
          thumbnail_url: '',
        }],
      }],
    };
    const blankRatings = {
      ratings: {
        1: '0',
        2: '0',
        3: '0',
        4: '0',
        5: '1',
      },
    };

    allProducts.current[10001] = [blankInfo, blankStyles, blankRatings];
    setDataStore(allProducts.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const yes = true; // Airbnb made me do it
  const no = false;
  return (
    <div className="widgetContainer">
      <Carousel
        rpMode={yes}
        dataStore={dataStore}
        related={related}
        burn={burn}
        outfitList={outfitList}
        outfitToggle={outfitToggle}
      />
      <Carousel
        rpMode={no}
        dataStore={dataStore}
        related={related}
        burn={burn}
        outfitList={outfitList}
        outfitToggle={outfitToggle}
      />
    </div>
  );
}

export default RelatedProducts;
