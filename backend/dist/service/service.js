"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userRepository_1 = require("../repository/userRepository");
const offersRepository_1 = require("../repository/offersRepository");
const categoryRepository_1 = require("../repository/categoryRepository");
const utils_1 = require("../utils/utils");
const authManager_1 = __importDefault(require("../auth/authManager"));
const reviewRepository_1 = require("../repository/reviewRepository");
class Service {
    constructor() {
        this.userRepo = new userRepository_1.UserRepository();
        this.offersRepo = new offersRepository_1.OffersRepository();
        this.categoryRepo = new categoryRepository_1.CategoryRepository();
        this.reviewRepo = new reviewRepository_1.ReviewRepository();
        this.authManager = new authManager_1.default();
        this.loggedInUsers = new Map();
        this.log = (0, utils_1.getLogger)("Service");
    }
    /**
     * Verifies the token passed as an argument
     * through the AuthManager instance
     *
     * @param token The token to be verified
     * @returns The decoded token if the token is valid, an empty string otherwise
     */
    verifyToken(token) {
        return this.authManager.verifyToken(token);
    }
    /**
     * Logs in the user with the given username and password
     *
     * @param username The username of the user
     * @param password The password of the user
     * @returns The token if the login was successful, undefined otherwise
     */
    async login(username, password) {
        let token = undefined;
        let user = undefined;
        try {
            user = await this.userRepo.login(username, password);
            if (user) {
                token = this.authManager.generateToken(user.username);
                this.loggedInUsers.set(token, user);
            }
        }
        catch (error) {
            this.log("Error logging in", error);
        }
        return { token, user };
    }
    /**
     * Registers the user with the given user object and password
     *
     * @param user The user object to be registered
     * @param password The password of the user
     * @returns The token if the registration was successful, undefined otherwise
     */
    async register(user, password) {
        let token = undefined;
        try {
            await this.userRepo.register(user, password);
            token = this.authManager.generateToken(user.username);
            this.loggedInUsers.set(token, user);
        }
        catch (error) {
            this.log("Error registering", error);
        }
        return token;
    }
    /**
     * Removes the user with the given token from the logged in users list
     *
     * @param token The token of the user
     * @returns True if the user was successfully logged out, false otherwise
     */
    logout(token) {
        return this.loggedInUsers.delete(token);
    }
    checkLoggedIn(token) {
        return this.loggedInUsers.has(token);
    }
    async getOffers(meserias_id, categoryName) {
        try {
            if (meserias_id) {
                return this.offersRepo.getMeseriasOffers(meserias_id);
            }
            else if (categoryName) {
                return this.offersRepo.getOffersByCategoryName(categoryName);
            }
            else {
                return this.offersRepo.getOffers();
            }
        }
        catch (error) {
            this.log("Error getting offers", error);
            throw new Error("Couldn't get offers!");
        }
    }
    async getUserById(userId) {
        try {
            return await this.userRepo.getUserById(userId);
        }
        catch (error) {
            this.log("Error getting user", error);
            throw new Error("Couldn't get user!");
        }
    }
    /**
     * Updates the user with the given user object
     * @param user The user object to be updated
     * @returns The updated user if the operation was successful
     * @throws Error if the operation couldn't be completed
     */
    async updateUser(user) {
        try {
            return await this.userRepo.updateUser(user);
        }
        catch (error) {
            this.log("Error updating user", error);
            throw new Error("Couldn't update user!");
        }
    }
    /**
     * Changes the password of the user with the given id
     * @param userId The id of the user
     * @param oldPassword The old password
     * @param newPassword The new password
     * @throws Error if the operation couldn't be completed
     */
    async changePassword(userId, oldPassword, newPassword) {
        try {
            await this.userRepo.changePassword(userId, oldPassword, newPassword);
        }
        catch (error) {
            this.log("Error changing password", error);
            throw new Error("Couldn't change password!");
        }
    }
    async addOffer(offer) {
        try {
            await this.offersRepo.addOffer(offer);
        }
        catch (error) {
            this.log("Error adding offer", error);
            throw new Error("Couldn't add offer!");
        }
    }
    /**
     * Updates an offer in the OffersRepository instance
     * @param offer The offer to be updated
     */
    async updateOffer(offer) {
        try {
            await this.offersRepo.updateOffer(offer);
        }
        catch (error) {
            this.log("Error updating offer", error);
            throw new Error("Couldn't update offer!");
        }
    }
    /**
     * Deletes an offer from the OffersRepository instance
     * @param offerId The id of the offer to be deleted
     */
    async deleteOffer(offerId) {
        try {
            await this.offersRepo.deleteOffer(offerId);
        }
        catch (error) {
            this.log("Error deleting offer", error);
            throw new Error("Couldn't delete offer!");
        }
    }
    /**
     * Returns offers with some filters applied
     * @param filters The filters to apply to the offers
     */
    async filterOffers(filters) {
        try {
            return (await this.offersRepo.getOffers()).filter((offer) => {
                return ((!filters.county || filters.county === offer.meserias.county) &&
                    (!filters.category_name || filters.category_name === offer.category.Name));
            });
        }
        catch (error) {
            this.log("Error filtering offers", error);
            throw new Error("Couldn't filter offers!");
        }
    }
    /**
     * Gets the categories from the CategoryRepository instance
     * @returns The categories if the operation was successful, an empty array otherwise
     */
    async getCategories() {
        return this.categoryRepo.getCategories();
    }
    async getReviews() {
        try {
            return await this.reviewRepo.getReviews();
        }
        catch (error) {
            this.log("Error getting reviews", error);
            throw new Error("Couldn't get reviews!");
        }
    }
    async getAverageReview(userId) {
        try {
            return await this.reviewRepo.getAverageReviewForUser(userId);
        }
        catch (error) {
            this.log("Error getting average review", error);
            throw new Error("Couldn't fetch average review!");
        }
    }
    /**
     * Adds a new review.
     * @param review The review object to add.
     * @returns The ID of the newly added review.
     */
    async addReview(meseriasId, review) {
        try {
            return await this.reviewRepo.addReview(meseriasId, review);
        }
        catch (error) {
            this.log("Error adding review", error);
            throw new Error("Couldn't add the review!");
        }
    }
}
exports.default = Service;
