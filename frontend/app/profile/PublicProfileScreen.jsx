import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Animated,Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; 
import StarRating from 'react-native-star-rating-widget'; 
import { useNavigation, useRoute } from '@react-navigation/native';
import ApiService from '../service/ApiService';

import AsyncStorage from '@react-native-async-storage/async-storage';

const PublicProfileScreen = () => {
  const route = useRoute();
  const user1 = route.params.user;
    const [user, setUser] = useState(user1);

  const userData = {
    id: user.id,
    username: user.username,  
    first_name: user.first_name,
    last_name: user.last_name,
    phone_number: user.phone_number,
    address: user.address,        
    date: user.date,
    password: user.password,
    type: "user",
    version: 1,
  };

  const [offers, setOffers] = useState([]);
  const [reviewAvg, setAvg] = useState([]);
  const [selectedStars, setSelectedStars] = useState(0); // State for selected stars for the review
  const navigation = useNavigation();

  const [isReviewVisible, setIsReviewVisible] = useState(false); // Starea pentru review
  const [slideAnim] = useState(new Animated.Value(-300)); // Animația pentru slide
  const [widthAnim] = useState(new Animated.Value(0)); // Animația pentru lățimea containerului
  const [opacityAnim] = useState(new Animated.Value(1));

  // Obținem lățimea ecranului
  const screenWidth = Dimensions.get('window').width;

  // Funcția care va controla deschiderea în animație
  const toggleReview = () => {
    const middlePosition = (screenWidth - 300) / 2; // Calculăm poziția pentru mijlocul ecranului, având în vedere lățimea containerului

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: isReviewVisible ? -300 : middlePosition, // Se deplasează de la dreapta la stânga
        duration: 300, // Durata animației
        useNativeDriver: true, // Folosirea driverului nativ pentru performanță mai bună
      }),
      Animated.timing(widthAnim, {
        toValue: isReviewVisible ? 0 : 300, // Lățimea se va reduce la 0 când se închide
        duration: 300,
        useNativeDriver: false, // Folosim false deoarece modificăm lățimea, nu o proprietate animată nativ
      })
    ]).start();

    // Comută vizibilitatea review-ului
    setIsReviewVisible(!isReviewVisible);
  };

   // Animația pentru sclipire
   const startBlinking = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.7, // Reduce opacitatea la 50%
          duration: 1000, // Durata pentru scădere
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1, // Revine la opacitate completă
          duration: 1000, // Durata pentru creștere
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Pornește animația de sclipire la montarea componentei
  useEffect(() => {
    startBlinking();
  }, []);
  
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user_profile');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };
    ApiService.loadTokenFromStorage();
    loadUser();
  }, []);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const userOffers = await ApiService.getOffersByMeseriasId(userData.id);
        console.log("Offers", userOffers);
        setOffers(userOffers);
      } catch (error) {
        console.error('Error fetching offers:', error);
      }
    };

    fetchOffers();
  }, [userData.id]);

  useEffect(() => {
    const fetchReviewAvg = async () => {
      try {
        const reviewAvg = await ApiService.getAverageReviewForUser(userData.id);
        setAvg(reviewAvg);
      } catch (error) {
        console.error('Error fetching average review:', error);
      }
    };

    fetchReviewAvg();
  }, [userData.id]);

  // Handle review submission
  const handleReviewSubmit = async () => {
    if (selectedStars === 0) {
      alert('Please select a rating!');
      return;
    }

    try {
      await ApiService.submitReview(userData.id, selectedStars, 'Great service!');
      alert('Thank you for your review!');
      setSelectedStars(0); // Reset the stars after submission
    } catch (error) {
      console.error('Error submitting review:', error);
    }

    
    const reviewAvg = await ApiService.getAverageReviewForUser(userData.id);
    setAvg(reviewAvg);
  };

  // const renderOffer = ({ item }) => (
  //   <TouchableOpacity style={styles.offerCard} onPress={() => handleOfferPress(item)}>
  //     <Text style={styles.offerTitle}>{item.title}</Text>
  //     <Text style={styles.offerDescription}>
  //       {item.description.substring(0, 200)}{item.description.length > 100 ? '...' : ''}
  //     </Text>
  //     <Text>Pret de la: {item.start_price} RON</Text>
  //     <Text style={styles.offerCategory}>{item.category.Name}</Text>
  //   </TouchableOpacity>
  // );

  return (
    <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.outerContainer}      
        indicatorStyle="black" // Culoare pentru bara de scroll
        showsVerticalScrollIndicator={true} // Arată bara de scroll verticală
        showsHorizontalScrollIndicator={false}>
      <View style={styles.innerContainer}>
      <View style={styles.profileContainer}>
        <Image source={require('./images/default.png')} style={styles.profileImage} />
        <Text style={styles.name}>{userData.first_name} {userData.last_name}</Text>
        <View style={styles.starContainer}>
          <StarRating rating={reviewAvg} onChange={() => {}} starSize={30} />
        </View>
        <Text style={styles.username}>@{userData.username}</Text>

        <View style={styles.detailRow}>
          <Icon name="phone" size={20} color="gray" />
          <Text style={styles.phone}> {userData.phone_number}</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="home" size={20} color="gray" />
          <Text style={styles.detail}> {userData.address}</Text>
        </View>
        </View>

        <View style={styles.offersHeaderContainer}>
            <Text style={styles.offersHeaderText}>Oferte disponibile</Text>          
          </View>    

          {/* Bara orizontală */}
          <View style={styles.horizontalLine}></View>   

          {/* Afișează ofertele utilizatorului */}
          {offers.length > 0 ? (
            offers.map((offer) => (
              <View key={offer.id} style={styles.offerCard}>
                {/* Textul și informațiile despre ofertă */}
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.offerDescription}>
                  {offer.description} {/* Afisăm întreaga descriere */}
                </Text>
                <Text style={styles.offerPrice}>Pret de la: {offer.start_price} RON</Text>
                <Text style={styles.offerCategory}>{offer.category.Name}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noOffersText}>Nu sunt oferte disponibile.</Text>
          )}
          </View> 

          </ScrollView>
        {/* Secțiunea de Review care va apărea și dispărea */}
        <Animated.View
          style={[
            styles.reviewContainer,
            {
              transform: [{ translateX: slideAnim }], // Aplicăm animația de slide
              width: widthAnim, // Aplicăm animația de lățime
            },
          ]}
        >
          <Text style={styles.reviewTitle}>Dă o notă utilizatorului:</Text>
          <StarRating
            rating={selectedStars}
            onChange={(rating) => setSelectedStars(rating)}
            starSize={40}
            style={styles.starRating}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleReviewSubmit}>
            <Text style={styles.submitButtonText}>Trimite</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Butonul pentru deschiderea review-ului */}
        <Animated.View style={[styles.reviewButton, { opacity: opacityAnim }]}>
          <TouchableOpacity onPress={toggleReview}>
            <Icon name="star" size={30} color="#4a90e2" />
          </TouchableOpacity>
        </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative', // Permite plasarea absolută a elementului de review
  },
  outerContainer: {
    backgroundColor: '#4a90e2',
    padding: 10,
  },
  innerContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginHorizontal: 10,
    paddingVertical: 20,
    alignItems: 'center',
    position: 'relative',
    // Nu mai folosim flex: 1, astfel încât să permite derularea
    paddingBottom: 20,  // Adăugăm un padding inferior pentru a preveni tăierea conținutului
  },  
  profileContainer: {
    flex: 1,
    // backgroundColor: 'white',
    borderRadius: 15,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',  // Permite poziționarea absolută a butoanelor în interiorul acestui container
    width: '100%',  // Asigură-te că ocupă întreaga lățime
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 10,
  },
  phone: {
    fontSize: 16,
    marginBottom: 15,
  },
  offersHeaderContainer: {
    flexDirection: 'row',              // Elemente pe orizontală
    justifyContent: 'space-between',    // Textul și butonul sunt plasate pe margini opuse
    alignItems: 'center',              // Centrează vertical elementele
    marginVertical: 10,                // Spațiu între această secțiune și restul conținutului
    paddingLeft: 100,
    paddingRight: 100,
    width: '100%',                     // Lățimea completă
  },
  
  offersHeaderText: {
    fontSize: 20,                      // Dimensiune text
    fontWeight: 'bold',                // Font mai îngroșat pentru titlu
    color: 'black',                    // Culoare text
    textAlign: 'center',               // Centrează textul pe orizontală
    flex: 1,                           // Permite alinierea textului la mijloc
  },
  horizontalLine: {
    width: '90%',                // Lățimea barei
    height: 1,                   // Grosimea barei
    backgroundColor: 'gray',     // Culoare bară
    marginTop: 10,               // Spațiu între text și bară
    marginBottom: 20,               // Spațiu între text și bară
  },
  detail: {
    fontSize: 14,
    marginBottom: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  offerCard: {
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 }, // Umbra uniformă pe toate marginile
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5, // Crește valoarea pentru a intensifica umbra pe Android
    marginBottom: 10,
    width: '90%',
    position: 'relative',
  },  
  editIconContainer: {
    position: 'absolute',
    bottom: 10, // Așează iconul deasupra marginii de jos
    right: 10, // Așează iconul în colțul din dreapta
    zIndex: 1, // Asigură-te că iconul apare deasupra altor elemente
  },
  offerTitle: {
    fontSize: 20,  // Mărim fontul pentru titlu pentru a-l face mai vizibil
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins', // Schimbăm fontul
  },
  offerDescription: {
    marginTop: 10,
    fontSize: 16,  // Mărim fontul pentru o lizibilitate mai bună
    color: '#555',
    lineHeight: 22,  // Spunem mai mult spațiu între linii
    fontFamily: 'Roboto', // Schimbăm fontul
  },
  offerPrice: {
    marginTop: 10,
    fontSize: 18,  // Mărim fontul prețului
    fontWeight: 'bold',
    color: '#878CD8', // Culoare mai puternică pentru a face prețul să iasă în evidență
    fontFamily: 'Poppins', // Schimbăm fontul
  },
  offerCategory: {
    marginTop: 5,
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
    fontFamily: 'Roboto', // Schimbăm fontul
  },
  noOffersText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  reviewContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0, // Poziționăm review-ul în partea stângă
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    borderColor: "black",
    borderTopRightRadius: 10, // Colțurile rotunjite pe partea dreaptă
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  starRating: {
    marginVertical: 10,
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reviewButton: {
    position: 'absolute',
    top: '50%', // Poziționează butonul la mijloc pe verticală
    right: 0, // Butonul este lipit de marginea dreaptă a containerului
    backgroundColor: 'white', // Culoare pentru buton
    padding: 15,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    zIndex: 2, // Asigură că butonul este deasupra altor elemente
    transform: [{ translateY: -20 }], // Corectare pentru a-l alinia perfect la mijloc
    borderWidth: 1, // Grosimea bordurii
    borderColor: '#4a90e2', // Culoarea bordurii
  },  
});

export default PublicProfileScreen;
