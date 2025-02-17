"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const firestore_1 = require("firebase/firestore");
const firebaseConfig_1 = require("../utils/firebaseConfig");
const utils_1 = require("../utils/utils");
class CategoryRepository {
    constructor() {
        this.categoriesCollection = (0, firestore_1.collection)(firebaseConfig_1.db, "categories");
        this.log = (0, utils_1.getLogger)("CategoryRepository");
    }
    async getCategories() {
        const q = (0, firestore_1.query)(this.categoriesCollection);
        const qSnapshot = await (0, firestore_1.getDocs)(q).catch((error) => {
            console.error("Error getting documents: ", error);
            throw new Error("Couldn't get categories!");
        });
        if (qSnapshot.docs.length === 0) {
            this.log("No categories found");
            return undefined;
        }
        const categories = [];
        for (const doc of qSnapshot.docs) {
            const category = Object.assign({ id: doc.id }, doc.data());
            // const category = doc.data() as Category;
            category.id = doc.id;
            categories.push(category);
        }
        this.log("categories", categories);
        return categories;
    }
}
exports.CategoryRepository = CategoryRepository;
