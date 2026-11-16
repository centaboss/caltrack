export type FoodCategory =
  'protein' | 'carbs' | 'fruit' | 'veggies' | 'dairy' | 'fats' | 'snacks' | 'drinks' | 'fastfood';

export interface FoodCategoryMeta {
  value: FoodCategory;
  label: string;
}

export const FOOD_CATEGORIES: FoodCategoryMeta[] = [
  { value: 'protein', label: 'Protein' },
  { value: 'carbs', label: 'Carbs' },
  { value: 'fruit', label: 'Fruit' },
  { value: 'veggies', label: 'Veggies' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'fats', label: 'Fats' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'drinks', label: 'Drinks' },
  { value: 'fastfood', label: 'Fast food' },
];

export interface FoodPreset {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: FoodCategory;
}

export const FOOD_PRESETS: FoodPreset[] = [
  // Protein
  { name: 'Grilled chicken breast', calories: 165, protein: 31, carbs: 0, fat: 4, category: 'protein' },
  { name: 'Grilled salmon fillet', calories: 367, protein: 40, carbs: 0, fat: 22, category: 'protein' },
  { name: 'Lean beef steak', calories: 250, protein: 26, carbs: 0, fat: 15, category: 'protein' },
  { name: 'Turkey breast', calories: 135, protein: 30, carbs: 0, fat: 1, category: 'protein' },
  { name: 'Canned tuna', calories: 116, protein: 26, carbs: 0, fat: 1, category: 'protein' },
  { name: 'Cooked shrimp', calories: 99, protein: 24, carbs: 0, fat: 0, category: 'protein' },
  { name: 'Firm tofu', calories: 144, protein: 17, carbs: 3, fat: 8, category: 'protein' },
  { name: 'Cooked lentils', calories: 230, protein: 18, carbs: 40, fat: 1, category: 'protein' },
  { name: 'Ground beef', calories: 250, protein: 26, carbs: 0, fat: 15, category: 'protein' },
  { name: 'Pork chop', calories: 231, protein: 26, carbs: 0, fat: 14, category: 'protein' },
  { name: 'Egg whites (3)', calories: 51, protein: 11, carbs: 0, fat: 0, category: 'protein' },
  { name: 'Scrambled eggs (2)', calories: 200, protein: 14, carbs: 2, fat: 15, category: 'protein' },

  // Carbs
  { name: 'Steamed white rice', calories: 205, protein: 4, carbs: 45, fat: 0, category: 'carbs' },
  { name: 'Brown rice', calories: 216, protein: 5, carbs: 45, fat: 2, category: 'carbs' },
  { name: 'Quinoa', calories: 222, protein: 8, carbs: 39, fat: 4, category: 'carbs' },
  { name: 'Pasta with tomato sauce', calories: 330, protein: 11, carbs: 60, fat: 5, category: 'carbs' },
  { name: 'Sweet potato', calories: 180, protein: 4, carbs: 41, fat: 0, category: 'carbs' },
  { name: 'Whole wheat bread (2)', calories: 160, protein: 8, carbs: 28, fat: 2, category: 'carbs' },
  { name: 'Plain bagel', calories: 271, protein: 11, carbs: 53, fat: 2, category: 'carbs' },
  { name: 'Flour tortilla', calories: 146, protein: 4, carbs: 24, fat: 4, category: 'carbs' },
  { name: 'Mashed potatoes', calories: 237, protein: 4, carbs: 35, fat: 9, category: 'carbs' },
  { name: 'Oatmeal with milk', calories: 220, protein: 8, carbs: 36, fat: 5, category: 'carbs' },
  { name: 'Pancakes (2)', calories: 175, protein: 5, carbs: 22, fat: 7, category: 'carbs' },
  { name: 'Cereal with milk', calories: 190, protein: 7, carbs: 34, fat: 3, category: 'carbs' },

  // Fruit
  { name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0, category: 'fruit' },
  { name: 'Apple', calories: 95, protein: 0, carbs: 25, fat: 0, category: 'fruit' },
  { name: 'Orange', calories: 62, protein: 1, carbs: 15, fat: 0, category: 'fruit' },
  { name: 'Strawberries', calories: 49, protein: 1, carbs: 12, fat: 0, category: 'fruit' },
  { name: 'Blueberries', calories: 84, protein: 1, carbs: 21, fat: 0, category: 'fruit' },
  { name: 'Grapes', calories: 104, protein: 1, carbs: 27, fat: 0, category: 'fruit' },
  { name: 'Mango', calories: 99, protein: 1, carbs: 25, fat: 1, category: 'fruit' },
  { name: 'Watermelon', calories: 46, protein: 1, carbs: 12, fat: 0, category: 'fruit' },

  // Veggies
  { name: 'Garden salad', calories: 120, protein: 4, carbs: 12, fat: 7, category: 'veggies' },
  { name: 'Broccoli', calories: 55, protein: 4, carbs: 11, fat: 1, category: 'veggies' },
  { name: 'Spinach', calories: 7, protein: 1, carbs: 1, fat: 0, category: 'veggies' },
  { name: 'Carrot sticks', calories: 52, protein: 1, carbs: 12, fat: 0, category: 'veggies' },
  { name: 'Mixed vegetables', calories: 80, protein: 4, carbs: 16, fat: 0, category: 'veggies' },
  { name: 'Roasted vegetables', calories: 150, protein: 4, carbs: 20, fat: 7, category: 'veggies' },
  { name: 'Cucumber', calories: 16, protein: 1, carbs: 4, fat: 0, category: 'veggies' },

  // Dairy
  { name: 'Greek yogurt', calories: 130, protein: 17, carbs: 8, fat: 4, category: 'dairy' },
  { name: 'Whole milk', calories: 149, protein: 8, carbs: 12, fat: 8, category: 'dairy' },
  { name: 'Almond milk', calories: 39, protein: 1, carbs: 3, fat: 3, category: 'dairy' },
  { name: 'Cheddar cheese', calories: 113, protein: 7, carbs: 0, fat: 9, category: 'dairy' },
  { name: 'Cottage cheese', calories: 206, protein: 28, carbs: 8, fat: 9, category: 'dairy' },
  { name: 'String cheese', calories: 80, protein: 6, carbs: 1, fat: 6, category: 'dairy' },
  { name: 'Cream cheese', calories: 102, protein: 2, carbs: 2, fat: 10, category: 'dairy' },

  // Fats
  { name: 'Almonds (28 g)', calories: 164, protein: 6, carbs: 6, fat: 14, category: 'fats' },
  { name: 'Peanut butter (2 tbsp)', calories: 188, protein: 8, carbs: 6, fat: 16, category: 'fats' },
  { name: 'Avocado (half)', calories: 160, protein: 2, carbs: 9, fat: 15, category: 'fats' },
  { name: 'Olive oil (1 tbsp)', calories: 119, protein: 0, carbs: 0, fat: 14, category: 'fats' },
  { name: 'Walnuts (28 g)', calories: 185, protein: 4, carbs: 4, fat: 18, category: 'fats' },
  { name: 'Chia seeds (2 tbsp)', calories: 138, protein: 5, carbs: 12, fat: 9, category: 'fats' },

  // Snacks
  { name: 'Chocolate bar', calories: 235, protein: 3, carbs: 26, fat: 13, category: 'snacks' },
  { name: 'Ice cream (1 scoop)', calories: 210, protein: 4, carbs: 24, fat: 11, category: 'snacks' },
  { name: 'Potato chips (28 g)', calories: 152, protein: 2, carbs: 15, fat: 10, category: 'snacks' },
  { name: 'Popcorn (3 cups)', calories: 93, protein: 3, carbs: 19, fat: 1, category: 'snacks' },
  { name: 'Granola bar', calories: 120, protein: 3, carbs: 20, fat: 4, category: 'snacks' },
  { name: 'Cookies (2)', calories: 150, protein: 2, carbs: 20, fat: 7, category: 'snacks' },
  { name: 'Pretzels (28 g)', calories: 108, protein: 3, carbs: 23, fat: 1, category: 'snacks' },
  { name: 'Protein bar', calories: 200, protein: 20, carbs: 22, fat: 7, category: 'snacks' },

  // Drinks
  { name: 'Black coffee', calories: 2, protein: 0, carbs: 0, fat: 0, category: 'drinks' },
  { name: 'Latte with milk', calories: 120, protein: 6, carbs: 10, fat: 6, category: 'drinks' },
  { name: 'Orange juice', calories: 112, protein: 2, carbs: 26, fat: 0, category: 'drinks' },
  { name: 'Soda (330 ml)', calories: 139, protein: 0, carbs: 39, fat: 0, category: 'drinks' },
  { name: 'Beer (330 ml)', calories: 143, protein: 2, carbs: 11, fat: 0, category: 'drinks' },
  { name: 'Protein shake', calories: 160, protein: 30, carbs: 6, fat: 2, category: 'drinks' },
  { name: 'Green tea', calories: 2, protein: 0, carbs: 0, fat: 0, category: 'drinks' },
  { name: 'Sports drink (500 ml)', calories: 130, protein: 0, carbs: 34, fat: 0, category: 'drinks' },

  // Fast food
  { name: 'Cheese pizza slice', calories: 285, protein: 12, carbs: 36, fat: 10, category: 'fastfood' },
  { name: 'Beef burger', calories: 540, protein: 25, carbs: 45, fat: 29, category: 'fastfood' },
  { name: 'Chicken Caesar wrap', calories: 440, protein: 26, carbs: 38, fat: 20, category: 'fastfood' },
  { name: 'French fries', calories: 365, protein: 4, carbs: 48, fat: 17, category: 'fastfood' },
  { name: 'Fried chicken', calories: 320, protein: 21, carbs: 11, fat: 21, category: 'fastfood' },
  { name: 'Sushi roll (6 pcs)', calories: 255, protein: 9, carbs: 38, fat: 7, category: 'fastfood' },
  { name: 'Burrito', calories: 590, protein: 23, carbs: 68, fat: 24, category: 'fastfood' },
  { name: 'Chicken nuggets (6)', calories: 280, protein: 14, carbs: 16, fat: 18, category: 'fastfood' },
  { name: 'Hot dog', calories: 290, protein: 10, carbs: 24, fat: 17, category: 'fastfood' },
  { name: 'Glazed donut', calories: 253, protein: 3, carbs: 31, fat: 14, category: 'fastfood' },
  { name: 'Breakfast burrito', calories: 430, protein: 20, carbs: 38, fat: 22, category: 'fastfood' },
];
