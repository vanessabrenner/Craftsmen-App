"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRepository = void 0;
const firestore_1 = require("firebase/firestore");
const firebaseConfig_1 = require("../utils/firebaseConfig");
const utils_1 = require("../utils/utils");
class ReviewRepository {
    constructor() {
        this.reviewCollection = (0, firestore_1.collection)(firebaseConfig_1.db, "review");
        this.usersCollection = (0, firestore_1.collection)(firebaseConfig_1.db, "users");
        this.log = (0, utils_1.getLogger)("ReviewRepository");
    }
    /**
     * Fetch all reviews from the 'review' collection.
     * @returns A list of reviews or undefined if no reviews found.
     */
    async getReviews() {
        const q = (0, firestore_1.query)(this.reviewCollection);
        const qSnapshot = await (0, firestore_1.getDocs)(q).catch((error) => {
            console.error("Error getting documents: ", error);
            throw new Error("Couldn't get reviews!");
        });
        if (qSnapshot.docs.length === 0) {
            this.log("No reviews found");
            return undefined;
        }
        const reviews = [];
        for (const doc of qSnapshot.docs) {
            const reviewData = doc.data();
            // Resolve Firestore references for 'user' and 'meserias'
            const userRef = reviewData.user;
            const meseriasRef = reviewData.meserias;
            const userDoc = await (0, firestore_1.getDoc)(userRef);
            const meseriasDoc = await (0, firestore_1.getDoc)(meseriasRef);
            // Replace references with actual user and meserias data
            if (userDoc.exists() && meseriasDoc.exists()) {
                reviewData.user = Object.assign({ id: userDoc.id }, userDoc.data());
                reviewData.meserias = Object.assign({ id: meseriasDoc.id }, meseriasDoc.data());
            }
            reviewData.id = doc.id; // Add the document ID
            reviews.push(reviewData);
        }
        this.log("Resolved reviews", reviews);
        return reviews;
    }
    /**
         * Fetch reviews by a specific star count.
         * @param starCount The star count to filter by (1-5).
         * @returns A list of reviews matching the star count.
         */
    async getReviewsByStarCount(starCount) {
        if (starCount < 1 || starCount > 5) {
            throw new Error("Star count must be between 1 and 5.");
        }
        const q = (0, firestore_1.query)(this.reviewCollection, (0, firestore_1.where)("stars", "==", starCount));
        const qSnapshot = await (0, firestore_1.getDocs)(q).catch((error) => {
            console.error("Error getting documents by star count: ", error);
            throw new Error("Couldn't get reviews by star count!");
        });
        if (qSnapshot.docs.length === 0) {
            this.log(`No reviews found with ${starCount} stars`);
            return undefined;
        }
        const reviews = [];
        for (const doc of qSnapshot.docs) {
            const review = doc.data();
            review.id = doc.id;
            reviews.push(review);
        }
        this.log(`reviews with ${starCount} stars`, reviews);
        return reviews;
    }
    /**
     * Add a new review to the database.
     * @param review The review object to add.
     * @returns The ID of the newly added review.
     */
    async addReview(meseriasId, review) {
        if (!review.meserias || !review.user || !review.stars || !review.text) {
            throw new Error("All fields (meserias, userId, stars, text) are required.");
        }
        try {
            // Fetch the user document from the Firestore collection
            const meseriasRef = (0, firestore_1.doc)(this.usersCollection, meseriasId);
            const meseriasDoc = await (0, firestore_1.getDoc)(meseriasRef).catch((error) => {
                this.log("Error getting documents: ", error);
                throw new Error("Couldn't get meserias!");
            });
            // Add the review with the user information to the Firestore
            const reviewWithUser = Object.assign(Object.assign({}, review), { meserias: meseriasRef });
            // Add the review document to the Firestore collection
            const reviewCollectionRef = (0, firestore_1.collection)(firebaseConfig_1.db, "review"); // Adjust the "reviews" collection name if different
            const newDocRef = await (0, firestore_1.addDoc)(reviewCollectionRef, reviewWithUser);
            this.log("Added new review with ID:", newDocRef.id);
            return newDocRef.id;
        }
        catch (error) {
            console.error("Error adding review: ", error);
            throw new Error("Couldn't add the review!");
        }
    }
    /**
     * Get the average star rating for a specific meserias.
     * @param meseriasId The ID of the meserias to calculate the average for.
     * @returns The average star rating or undefined if no reviews found.
     */
    async getAverageReviewForUser(meseriasId) {
        // Query reviews where the 'meserias' reference matches the provided meseriasId
        const q = (0, firestore_1.query)(this.reviewCollection, (0, firestore_1.where)("meserias", "==", (0, firestore_1.doc)(this.usersCollection, meseriasId)));
        // Get reviews
        const qSnapshot = await (0, firestore_1.getDocs)(q).catch((error) => {
            console.error("Error getting reviews for meserias: ", error);
            throw new Error("Couldn't get reviews for the specified meserias!");
        });
        // If no reviews are found, return 0 as the average
        if (qSnapshot.docs.length === 0) {
            this.log(`No reviews found for meserias with ID: ${meseriasId}`);
            return 0;
        }
        let totalStars = 0;
        // Iterate through the reviews and sum the stars
        for (const doc of qSnapshot.docs) {
            const review = doc.data();
            totalStars += review.stars;
        }
        // Calculate the average stars
        const averageStars = totalStars / qSnapshot.docs.length;
        this.log(`Average stars for meserias with ID ${meseriasId}:`, averageStars);
        return averageStars;
    }
}
exports.ReviewRepository = ReviewRepository;
