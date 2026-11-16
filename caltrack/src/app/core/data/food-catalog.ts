export type FoodCategory =
  'protein' | 'carbs' | 'fruit' | 'veggies' | 'dairy' | 'fats' | 'snacks' | 'drinks' | 'fastfood';

export interface FoodCategoryMeta {
  value: FoodCategory;
  label: string;
  emoji: string;
}

export const FOOD_CATEGORIES: FoodCategoryMeta[] = [
  { value: 'protein', label: 'Protein', emoji: '🍗' },
  { value: 'carbs', label: 'Carbs', emoji: '🍚' },
  { value: 'fruit', label: 'Fruit', emoji: '🍎' },
  { value: 'veggies', label: 'Veggies', emoji: '🥦' },
  { value: 'dairy', label: 'Dairy', emoji: '🥛' },
  { value: 'fats', label: 'Fats', emoji: '🥑' },
  { value: 'snacks', label: 'Snacks', emoji: '🍫' },
  { value: 'drinks', label: 'Drinks', emoji: '☕' },
  { value: 'fastfood', label: 'Fast food', emoji: '🍔' },
];

export interface FoodPreset {
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: FoodCategory;
}

export const FOOD_PRESETS: FoodPreset[] = [
  // Protein
  { name: 'Grilled chicken breast', emoji: '🍗', calories: 165, protein: 31, carbs: 0, fat: 4, category: 'protein' },
  { name: 'Grilled salmon fillet', emoji: '🐟', calories: 367, protein: 40, carbs: 0, fat: 22, category: 'protein' },
  { name: 'Lean beef steak', emoji: '🥩', calories: 250, protein: 26, carbs: 0, fat: 15, category: 'protein' },
  { name: 'Turkey breast', emoji: '🦃', calories: 135, protein: 30, carbs: 0, fat: 1, category: 'protein' },
  { name: 'Canned tuna', emoji: '🐟', calories: 116, protein: 26, carbs: 0, fat: 1, category: 'protein' },
  { name: 'Cooked shrimp', emoji: '🍤', calories: 99, protein: 24, carbs: 0, fat: 0, category: 'protein' },
  { name: 'Firm tofu', emoji: '🧊', calories: 144, protein: 17, carbs: 3, fat: 8, category: 'protein' },
  { name: 'Cooked lentils', emoji: '🫘', calories: 230, protein: 18, carbs: 40, fat: 1, category: 'protein' },
  { name: 'Ground beef', emoji: '🥩', calories: 250, protein: 26, carbs: 0, fat: 15, category: 'protein' },
  { name: 'Pork chop', emoji: '🥩', calories: 231, protein: 26, carbs: 0, fat: 14, category: 'protein' },
  { name: 'Egg whites (3)', emoji: '🥚', calories: 51, protein: 11, carbs: 0, fat: 0, category: 'protein' },
  { name: 'Scrambled eggs (2)', emoji: '🍳', calories: 200, protein: 14, carbs: 2, fat: 15, category: 'protein' },

  // Carbs
  { name: 'Steamed white rice', emoji: '🍚', calories: 205, protein: 4, carbs: 45, fat: 0, category: 'carbs' },
  { name: 'Brown rice', emoji: '🍚', calories: 216, protein: 5, carbs: 45, fat: 2, category: 'carbs' },
  { name: 'Quinoa', emoji: '🌾', calories: 222, protein: 8, carbs: 39, fat: 4, category: 'carbs' },
  { name: 'Pasta with tomato sauce', emoji: '🍝', calories: 330, protein: 11, carbs: 60, fat: 5, category: 'carbs' },
  { name: 'Sweet potato', emoji: '🍠', calories: 180, protein: 4, carbs: 41, fat: 0, category: 'carbs' },
  { name: 'Whole wheat bread (2)', emoji: '🍞', calories: 160, protein: 8, carbs: 28, fat: 2, category: 'carbs' },
  { name: 'Plain bagel', emoji: '🥯', calories: 271, protein: 11, carbs: 53, fat: 2, category: 'carbs' },
  { name: 'Flour tortilla', emoji: '🌮', calories: 146, protein: 4, carbs: 24, fat: 4, category: 'carbs' },
  { name: 'Mashed potatoes', emoji: '🥔', calories: 237, protein: 4, carbs: 35, fat: 9, category: 'carbs' },
  { name: 'Oatmeal with milk', emoji: '🥣', calories: 220, protein: 8, carbs: 36, fat: 5, category: 'carbs' },
  { name: 'Pancakes (2)', emoji: '🥞', calories: 175, protein: 5, carbs: 22, fat: 7, category: 'carbs' },
  { name: 'Cereal with milk', emoji: '🥣', calories: 190, protein: 7, carbs: 34, fat: 3, category: 'carbs' },

  // Fruit
  { name: 'Banana', emoji: '🍌', calories: 105, protein: 1, carbs: 27, fat: 0, category: 'fruit' },
  { name: 'Apple', emoji: '🍎', calories: 95, protein: 0, carbs: 25, fat: 0, category: 'fruit' },
  { name: 'Orange', emoji: '🍊', calories: 62, protein: 1, carbs: 15, fat: 0, category: 'fruit' },
  { name: 'Strawberries', emoji: '🍓', calories: 49, protein: 1, carbs: 12, fat: 0, category: 'fruit' },
  { name: 'Blueberries', emoji: '🫐', calories: 84, protein: 1, carbs: 21, fat: 0, category: 'fruit' },
  { name: 'Grapes', emoji: '🍇', calories: 104, protein: 1, carbs: 27, fat: 0, category: 'fruit' },
  { name: 'Mango', emoji: '🥭', calories: 99, protein: 1, carbs: 25, fat: 1, category: 'fruit' },
  { name: 'Watermelon', emoji: '🍉', calories: 46, protein: 1, carbs: 12, fat: 0, category: 'fruit' },

  // Veggies
  { name: 'Garden salad', emoji: '🥗', calories: 120, protein: 4, carbs: 12, fat: 7, category: 'veggies' },
  { name: 'Broccoli', emoji: '🥦', calories: 55, protein: 4, carbs: 11, fat: 1, category: 'veggies' },
  { name: 'Spinach', emoji: '🥬', calories: 7, protein: 1, carbs: 1, fat: 0, category: 'veggies' },
  { name: 'Carrot sticks', emoji: '🥕', calories: 52, protein: 1, carbs: 12, fat: 0, category: 'veggies' },
  { name: 'Mixed vegetables', emoji: '🥕', calories: 80, protein: 4, carbs: 16, fat: 0, category: 'veggies' },
  { name: 'Roasted vegetables', emoji: '🍆', calories: 150, protein: 4, carbs: 20, fat: 7, category: 'veggies' },
  { name: 'Cucumber', emoji: '🥒', calories: 16, protein: 1, carbs: 4, fat: 0, category: 'veggies' },

  // Dairy
  { name: 'Greek yogurt', emoji: '🥛', calories: 130, protein: 17, carbs: 8, fat: 4, category: 'dairy' },
  { name: 'Whole milk', emoji: '🥛', calories: 149, protein: 8, carbs: 12, fat: 8, category: 'dairy' },
  { name: 'Almond milk', emoji: '🥛', calories: 39, protein: 1, carbs: 3, fat: 3, category: 'dairy' },
  { name: 'Cheddar cheese', emoji: '🧀', calories: 113, protein: 7, carbs: 0, fat: 9, category: 'dairy' },
  { name: 'Cottage cheese', emoji: '🧀', calories: 206, protein: 28, carbs: 8, fat: 9, category: 'dairy' },
  { name: 'String cheese', emoji: '🧀', calories: 80, protein: 6, carbs: 1, fat: 6, category: 'dairy' },
  { name: 'Cream cheese', emoji: '🧀', calories: 102, protein: 2, carbs: 2, fat: 10, category: 'dairy' },

  // Fats
  { name: 'Almonds (28 g)', emoji: '🥜', calories: 164, protein: 6, carbs: 6, fat: 14, category: 'fats' },
  { name: 'Peanut butter (2 tbsp)', emoji: '🥜', calories: 188, protein: 8, carbs: 6, fat: 16, category: 'fats' },
  { name: 'Avocado (half)', emoji: '🥑', calories: 160, protein: 2, carbs: 9, fat: 15, category: 'fats' },
  { name: 'Olive oil (1 tbsp)', emoji: '🫒', calories: 119, protein: 0, carbs: 0, fat: 14, category: 'fats' },
  { name: 'Walnuts (28 g)', emoji: '🌰', calories: 185, protein: 4, carbs: 4, fat: 18, category: 'fats' },
  { name: 'Chia seeds (2 tbsp)', emoji: '🌱', calories: 138, protein: 5, carbs: 12, fat: 9, category: 'fats' },

  // Snacks
  { name: 'Chocolate bar', emoji: '🍫', calories: 235, protein: 3, carbs: 26, fat: 13, category: 'snacks' },
  { name: 'Ice cream (1 scoop)', emoji: '🍨', calories: 210, protein: 4, carbs: 24, fat: 11, category: 'snacks' },
  { name: 'Potato chips (28 g)', emoji: '🍟', calories: 152, protein: 2, carbs: 15, fat: 10, category: 'snacks' },
  { name: 'Popcorn (3 cups)', emoji: '🍿', calories: 93, protein: 3, carbs: 19, fat: 1, category: 'snacks' },
  { name: 'Granola bar', emoji: '🍫', calories: 120, protein: 3, carbs: 20, fat: 4, category: 'snacks' },
  { name: 'Cookies (2)', emoji: '🍪', calories: 150, protein: 2, carbs: 20, fat: 7, category: 'snacks' },
  { name: 'Pretzels (28 g)', emoji: '🥨', calories: 108, protein: 3, carbs: 23, fat: 1, category: 'snacks' },
  { name: 'Protein bar', emoji: '🍫', calories: 200, protein: 20, carbs: 22, fat: 7, category: 'snacks' },

  // Drinks
  { name: 'Black coffee', emoji: '☕', calories: 2, protein: 0, carbs: 0, fat: 0, category: 'drinks' },
  { name: 'Latte with milk', emoji: '☕', calories: 120, protein: 6, carbs: 10, fat: 6, category: 'drinks' },
  { name: 'Orange juice', emoji: '🧃', calories: 112, protein: 2, carbs: 26, fat: 0, category: 'drinks' },
  { name: 'Soda (330 ml)', emoji: '🥤', calories: 139, protein: 0, carbs: 39, fat: 0, category: 'drinks' },
  { name: 'Beer (330 ml)', emoji: '🍺', calories: 143, protein: 2, carbs: 11, fat: 0, category: 'drinks' },
  { name: 'Protein shake', emoji: '🥤', calories: 160, protein: 30, carbs: 6, fat: 2, category: 'drinks' },
  { name: 'Green tea', emoji: '🍵', calories: 2, protein: 0, carbs: 0, fat: 0, category: 'drinks' },
  { name: 'Sports drink (500 ml)', emoji: '🥤', calories: 130, protein: 0, carbs: 34, fat: 0, category: 'drinks' },

  // Fast food
  { name: 'Cheese pizza slice', emoji: '🍕', calories: 285, protein: 12, carbs: 36, fat: 10, category: 'fastfood' },
  { name: 'Beef burger', emoji: '🍔', calories: 540, protein: 25, carbs: 45, fat: 29, category: 'fastfood' },
  { name: 'Chicken Caesar wrap', emoji: '🌯', calories: 440, protein: 26, carbs: 38, fat: 20, category: 'fastfood' },
  { name: 'French fries', emoji: '🍟', calories: 365, protein: 4, carbs: 48, fat: 17, category: 'fastfood' },
  { name: 'Fried chicken', emoji: '🍗', calories: 320, protein: 21, carbs: 11, fat: 21, category: 'fastfood' },
  { name: 'Sushi roll (6 pcs)', emoji: '🍣', calories: 255, protein: 9, carbs: 38, fat: 7, category: 'fastfood' },
  { name: 'Burrito', emoji: '🌯', calories: 590, protein: 23, carbs: 68, fat: 24, category: 'fastfood' },
  { name: 'Chicken nuggets (6)', emoji: '🍗', calories: 280, protein: 14, carbs: 16, fat: 18, category: 'fastfood' },
  { name: 'Hot dog', emoji: '🌭', calories: 290, protein: 10, carbs: 24, fat: 17, category: 'fastfood' },
  { name: 'Glazed donut', emoji: '🍩', calories: 253, protein: 3, carbs: 31, fat: 14, category: 'fastfood' },
  { name: 'Breakfast burrito', emoji: '🌯', calories: 430, protein: 20, carbs: 38, fat: 22, category: 'fastfood' },
];
