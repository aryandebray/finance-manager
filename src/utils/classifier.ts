// Define the Category type
export type Category = 
  | 'FOOD'
  | 'TRANSPORTATION'
  | 'ENTERTAINMENT'
  | 'UTILITIES'
  | 'SHOPPING'
  | 'HEALTHCARE'
  | 'EDUCATION'
  | 'TRAVEL'
  | 'SALARY'
  | 'OTHER'

interface TrainingData {
  description: string
  category: Category
}

class NaiveBayesClassifier {
  private categories: Set<Category>
  private wordFrequencies: Map<Category, Map<string, number>>
  private categoryCounts: Map<Category, number>
  private totalDocuments: number
  private vocabulary: Set<string>

  constructor() {
    this.categories = new Set()
    this.wordFrequencies = new Map()
    this.categoryCounts = new Map()
    this.totalDocuments = 0
    this.vocabulary = new Set()
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0)
  }

  train(trainingData: TrainingData[]): void {
    // Initialize category maps
    trainingData.forEach(({ category }) => {
      this.categories.add(category)
      if (!this.wordFrequencies.has(category)) {
        this.wordFrequencies.set(category, new Map())
      }
      this.categoryCounts.set(category, (this.categoryCounts.get(category) || 0) + 1)
    })

    this.totalDocuments = trainingData.length

    // Count word frequencies per category
    trainingData.forEach(({ description, category }) => {
      const words = this.tokenize(description)
      words.forEach(word => {
        this.vocabulary.add(word)
        const frequencies = this.wordFrequencies.get(category)!
        frequencies.set(word, (frequencies.get(word) || 0) + 1)
      })
    })
  }

  private calculateLogProbability(word: string, category: Category): number {
    const frequencies = this.wordFrequencies.get(category)!
    const wordCount = frequencies.get(word) || 0
    const totalWordsInCategory = Array.from(frequencies.values()).reduce((a, b) => a + b, 0)
    const vocabularySize = this.vocabulary.size

    // Laplace smoothing
    return Math.log((wordCount + 1) / (totalWordsInCategory + vocabularySize))
  }

  classify(description: string): Category {
    const words = this.tokenize(description)
    let bestCategory: Category = 'OTHER'
    let bestScore = -Infinity

    this.categories.forEach(category => {
      // Prior probability
      const categoryCount = this.categoryCounts.get(category) || 0
      let score = Math.log(categoryCount / this.totalDocuments)

      // Add log probabilities of words
      words.forEach(word => {
        score += this.calculateLogProbability(word, category)
      })

      if (score > bestScore) {
        bestScore = score
        bestCategory = category
      }
    })

    return bestCategory
  }
}

// Pre-trained categories based on common transaction patterns
const trainingData: TrainingData[] = [
  // FOOD
  { description: 'grocery store purchase', category: 'FOOD' },
  { description: 'restaurant dinner', category: 'FOOD' },
  { description: 'coffee shop', category: 'FOOD' },
  { description: 'supermarket shopping', category: 'FOOD' },
  { description: 'food delivery', category: 'FOOD' },
  { description: 'lunch at work', category: 'FOOD' },
  { description: 'breakfast cafe', category: 'FOOD' },
  { description: 'grocery delivery', category: 'FOOD' },
  { description: 'food truck', category: 'FOOD' },
  { description: 'bakery purchase', category: 'FOOD' },

  // TRANSPORTATION
  { description: 'gas station', category: 'TRANSPORTATION' },
  { description: 'uber ride', category: 'TRANSPORTATION' },
  { description: 'public transport', category: 'TRANSPORTATION' },
  { description: 'taxi fare', category: 'TRANSPORTATION' },
  { description: 'car maintenance', category: 'TRANSPORTATION' },
  { description: 'parking fee', category: 'TRANSPORTATION' },
  { description: 'auto repair', category: 'TRANSPORTATION' },
  { description: 'bus ticket', category: 'TRANSPORTATION' },
  { description: 'train fare', category: 'TRANSPORTATION' },
  { description: 'car insurance', category: 'TRANSPORTATION' },

  // ENTERTAINMENT
  { description: 'movie tickets', category: 'ENTERTAINMENT' },
  { description: 'concert tickets', category: 'ENTERTAINMENT' },
  { description: 'amusement park', category: 'ENTERTAINMENT' },
  { description: 'streaming service', category: 'ENTERTAINMENT' },
  { description: 'video games', category: 'ENTERTAINMENT' },
  { description: 'sports event', category: 'ENTERTAINMENT' },
  { description: 'theater show', category: 'ENTERTAINMENT' },
  { description: 'museum visit', category: 'ENTERTAINMENT' },
  { description: 'gaming subscription', category: 'ENTERTAINMENT' },
  { description: 'music festival', category: 'ENTERTAINMENT' },

  // UTILITIES
  { description: 'electricity bill', category: 'UTILITIES' },
  { description: 'water bill', category: 'UTILITIES' },
  { description: 'internet service', category: 'UTILITIES' },
  { description: 'phone bill', category: 'UTILITIES' },
  { description: 'gas bill', category: 'UTILITIES' },
  { description: 'cable tv', category: 'UTILITIES' },
  { description: 'home internet', category: 'UTILITIES' },
  { description: 'mobile plan', category: 'UTILITIES' },
  { description: 'utility payment', category: 'UTILITIES' },
  { description: 'internet provider', category: 'UTILITIES' },

  // SHOPPING
  { description: 'clothing store', category: 'SHOPPING' },
  { description: 'electronics purchase', category: 'SHOPPING' },
  { description: 'online shopping', category: 'SHOPPING' },
  { description: 'department store', category: 'SHOPPING' },
  { description: 'furniture store', category: 'SHOPPING' },
  { description: 'shoe store', category: 'SHOPPING' },
  { description: 'bookstore', category: 'SHOPPING' },
  { description: 'gift shop', category: 'SHOPPING' },
  { description: 'jewelry store', category: 'SHOPPING' },
  { description: 'sporting goods', category: 'SHOPPING' },

  // HEALTHCARE
  { description: 'doctor visit', category: 'HEALTHCARE' },
  { description: 'pharmacy purchase', category: 'HEALTHCARE' },
  { description: 'hospital bill', category: 'HEALTHCARE' },
  { description: 'dental care', category: 'HEALTHCARE' },
  { description: 'medical supplies', category: 'HEALTHCARE' },
  { description: 'health insurance', category: 'HEALTHCARE' },
  { description: 'prescription drugs', category: 'HEALTHCARE' },
  { description: 'medical test', category: 'HEALTHCARE' },
  { description: 'eye care', category: 'HEALTHCARE' },
  { description: 'health clinic', category: 'HEALTHCARE' },

  // EDUCATION
  { description: 'tuition payment', category: 'EDUCATION' },
  { description: 'school supplies', category: 'EDUCATION' },
  { description: 'online course', category: 'EDUCATION' },
  { description: 'textbook purchase', category: 'EDUCATION' },
  { description: 'university fees', category: 'EDUCATION' },
  { description: 'educational software', category: 'EDUCATION' },
  { description: 'workshop fee', category: 'EDUCATION' },
  { description: 'training course', category: 'EDUCATION' },
  { description: 'student loan', category: 'EDUCATION' },
  { description: 'educational materials', category: 'EDUCATION' },

  // TRAVEL
  { description: 'hotel booking', category: 'TRAVEL' },
  { description: 'flight tickets', category: 'TRAVEL' },
  { description: 'vacation rental', category: 'TRAVEL' },
  { description: 'travel insurance', category: 'TRAVEL' },
  { description: 'car rental', category: 'TRAVEL' },
  { description: 'tour package', category: 'TRAVEL' },
  { description: 'cruise booking', category: 'TRAVEL' },
  { description: 'travel agency', category: 'TRAVEL' },
  { description: 'airport parking', category: 'TRAVEL' },
  { description: 'travel expenses', category: 'TRAVEL' },

  // SALARY
  { description: 'monthly salary', category: 'SALARY' },
  { description: 'paycheck deposit', category: 'SALARY' },
  { description: 'salary payment', category: 'SALARY' },
  { description: 'wage deposit', category: 'SALARY' },
  { description: 'income deposit', category: 'SALARY' },
  { description: 'payroll deposit', category: 'SALARY' },
  { description: 'salary credit', category: 'SALARY' },
  { description: 'monthly income', category: 'SALARY' },
  { description: 'wage payment', category: 'SALARY' },
  { description: 'salary transfer', category: 'SALARY' },

  // OTHER
  { description: 'miscellaneous expense', category: 'OTHER' },
  { description: 'unknown transaction', category: 'OTHER' },
  { description: 'general purchase', category: 'OTHER' },
  { description: 'various items', category: 'OTHER' },
  { description: 'mixed purchase', category: 'OTHER' },
  { description: 'general expense', category: 'OTHER' },
  { description: 'uncategorized', category: 'OTHER' },
  { description: 'misc purchase', category: 'OTHER' },
  { description: 'general transaction', category: 'OTHER' },
  { description: 'various expenses', category: 'OTHER' }
]

// Initialize and train the classifier
const classifier = new NaiveBayesClassifier()
classifier.train(trainingData)

export function classifyTransaction(description: string): Category {
  return classifier.classify(description)
} 