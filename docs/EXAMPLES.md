# Real-World Examples

Practical examples of using n2words in real-world applications.

## Table of Contents

- [Financial Applications](#financial-applications)
- [Invoicing and Receipts](#invoicing-and-receipts)
- [Check Writing](#check-writing)
- [Educational Tools](#educational-tools)
- [Accessibility](#accessibility)
- [E-commerce](#e-commerce)
- [Forms and Validation](#forms-and-validation)
- [Data Visualization](#data-visualization)
- [Voice Interfaces](#voice-interfaces)
- [Internationalization](#internationalization)

## Financial Applications

### Currency Formatter

```javascript
import { EnglishConverter } from 'n2words'

function formatCurrency(amount, currency = 'USD') {
  const dollars = Math.floor(amount)
  const cents = Math.round((amount - dollars) * 100)

  let result = EnglishConverter(dollars) + ' dollars'

  if (cents > 0) {
    result += ' and ' + EnglishConverter(cents) + ' cents'
  }

  return result
}

console.log(formatCurrency(1234.56))
// 'one thousand two hundred and thirty-four dollars and fifty-six cents'

console.log(formatCurrency(100.00))
// 'one hundred dollars'

console.log(formatCurrency(0.99))
// 'zero dollars and ninety-nine cents'
```

### Multi-Currency Support

```javascript
import { EnglishConverter, SpanishConverter, FrenchConverter } from 'n2words'

const currencyNames = {
  USD: { en: 'dollars', es: 'dólares', fr: 'dollars' },
  EUR: { en: 'euros', es: 'euros', fr: 'euros' },
  GBP: { en: 'pounds', es: 'libras', fr: 'livres' }
}

const converters = {
  en: EnglishConverter,
  es: SpanishConverter,
  fr: FrenchConverter
}

function formatCurrencyInternational(amount, currency, language) {
  const converter = converters[language]
  const currencyName = currencyNames[currency][language]
  const whole = Math.floor(amount)

  return `${converter(whole)} ${currencyName}`
}

console.log(formatCurrencyInternational(100, 'EUR', 'en'))
// 'one hundred euros'

console.log(formatCurrencyInternational(100, 'EUR', 'es'))
// 'cien euros'

console.log(formatCurrencyInternational(100, 'EUR', 'fr'))
// 'cent euros'
```

## Invoicing and Receipts

### Invoice Generator

```javascript
import { EnglishConverter } from 'n2words'

class Invoice {
  constructor() {
    this.items = []
  }

  addItem(description, quantity, price) {
    this.items.push({ description, quantity, price })
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  }

  getTotalInWords() {
    const total = this.getTotal()
    const dollars = Math.floor(total)
    const cents = Math.round((total - dollars) * 100)

    let words = EnglishConverter(dollars) + ' dollars'
    if (cents > 0) {
      words += ' and ' + EnglishConverter(cents) + ' cents'
    }

    return words
  }

  print() {
    console.log('INVOICE')
    console.log('=======')
    this.items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.description}`)
      console.log(`   Quantity: ${item.quantity} @ $${item.price.toFixed(2)}`)
      console.log(`   Subtotal: $${(item.quantity * item.price).toFixed(2)}`)
    })
    console.log('-------')
    console.log(`Total: $${this.getTotal().toFixed(2)}`)
    console.log(`Amount in words: ${this.getTotalInWords()}`)
  }
}

// Usage
const invoice = new Invoice()
invoice.addItem('Widget A', 10, 25.50)
invoice.addItem('Widget B', 5, 42.00)
invoice.addItem('Service Fee', 1, 100.00)
invoice.print()

// Output:
// INVOICE
// =======
// 1. Widget A
//    Quantity: 10 @ $25.50
//    Subtotal: $255.00
// 2. Widget B
//    Quantity: 5 @ $42.00
//    Subtotal: $210.00
// 3. Service Fee
//    Quantity: 1 @ $100.00
//    Subtotal: $100.00
// -------
// Total: $565.00
// Amount in words: five hundred and sixty-five dollars
```

### Receipt Template

```javascript
import { EnglishConverter } from 'n2words'

function generateReceipt(items, tax = 0.08) {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0)
  const taxAmount = subtotal * tax
  const total = subtotal + taxAmount

  return {
    subtotal: subtotal.toFixed(2),
    subtotalWords: EnglishConverter(Math.floor(subtotal)),
    tax: taxAmount.toFixed(2),
    taxWords: EnglishConverter(Math.floor(taxAmount)),
    total: total.toFixed(2),
    totalWords: EnglishConverter(Math.floor(total)),
    items: items
  }
}

const receipt = generateReceipt([
  { name: 'Coffee', price: 4.50 },
  { name: 'Sandwich', price: 8.95 },
  { name: 'Cookie', price: 2.50 }
])

console.log(`Subtotal: $${receipt.subtotal} (${receipt.subtotalWords} dollars)`)
console.log(`Tax: $${receipt.tax} (${receipt.taxWords} dollars)`)
console.log(`Total: $${receipt.total} (${receipt.totalWords} dollars)`)
```

## Check Writing

### Check Amount Formatter

```javascript
import { EnglishConverter } from 'n2words'

function formatCheckAmount(amount) {
  const dollars = Math.floor(amount)
  const cents = Math.round((amount - dollars) * 100)

  // Capitalize first letter for checks
  let dollarWords = EnglishConverter(dollars)
  dollarWords = dollarWords.charAt(0).toUpperCase() + dollarWords.slice(1)

  return `${dollarWords} and ${cents.toString().padStart(2, '0')}/100 dollars`
}

console.log(formatCheckAmount(1234.56))
// 'One thousand two hundred and thirty-four and 56/100 dollars'

console.log(formatCheckAmount(100.00))
// 'One hundred and 00/100 dollars'

console.log(formatCheckAmount(0.99))
// 'Zero and 99/100 dollars'
```

### Complete Check Generator

```javascript
import { EnglishConverter } from 'n2words'

class Check {
  constructor(payee, amount, date = new Date()) {
    this.payee = payee
    this.amount = amount
    this.date = date
  }

  getAmountInWords() {
    const dollars = Math.floor(this.amount)
    const cents = Math.round((this.amount - dollars) * 100)

    let words = EnglishConverter(dollars)
    words = words.charAt(0).toUpperCase() + words.slice(1)

    return `${words} and ${cents.toString().padStart(2, '0')}/100`
  }

  print() {
    console.log('─'.repeat(60))
    console.log(`Date: ${this.date.toLocaleDateString()}`)
    console.log(`Pay to the order of: ${this.payee}`)
    console.log(`Amount: $${this.amount.toFixed(2)}`)
    console.log(`Amount in words: ${this.getAmountInWords()} dollars`)
    console.log('─'.repeat(60))
  }
}

const check = new Check('John Smith', 1234.56)
check.print()
```

## Educational Tools

### Number Learning App

```javascript
import { EnglishConverter } from 'n2words'

class NumberTutor {
  generateQuiz(count = 10) {
    const questions = []

    for (let i = 0; i < count; i++) {
      const number = Math.floor(Math.random() * 1000)
      questions.push({
        number: number,
        answer: EnglishConverter(number)
      })
    }

    return questions
  }

  checkAnswer(number, userAnswer) {
    const correctAnswer = EnglishConverter(number).toLowerCase()
    const normalizedAnswer = userAnswer.toLowerCase().trim()

    return normalizedAnswer === correctAnswer
  }
}

const tutor = new NumberTutor()
const quiz = tutor.generateQuiz(5)

quiz.forEach((q, i) => {
  console.log(`${i + 1}. What is ${q.number} in words?`)
  console.log(`   Answer: ${q.answer}`)
})
```

### Multi-Language Learning

```javascript
import {
  EnglishConverter,
  SpanishConverter,
  FrenchConverter,
  GermanConverter
} from 'n2words'

class LanguageTutor {
  constructor() {
    this.languages = {
      en: { name: 'English', converter: EnglishConverter },
      es: { name: 'Spanish', converter: SpanishConverter },
      fr: { name: 'French', converter: FrenchConverter },
      de: { name: 'German', converter: GermanConverter }
    }
  }

  translate(number, targetLang) {
    const lang = this.languages[targetLang]
    return {
      number: number,
      language: lang.name,
      words: lang.converter(number)
    }
  }

  compareLanguages(number) {
    return Object.keys(this.languages).map(langCode => {
      return this.translate(number, langCode)
    })
  }
}

const tutor = new LanguageTutor()
const comparisons = tutor.compareLanguages(42)

comparisons.forEach(c => {
  console.log(`${c.language}: ${c.words}`)
})
// English: forty-two
// Spanish: cuarenta y dos
// French: quarante-deux
// German: zweiundvierzig
```

## Accessibility

### Screen Reader Enhancement

```javascript
import { EnglishConverter } from 'n2words'

function makeAccessible(element) {
  const numbers = element.querySelectorAll('[data-number]')

  numbers.forEach(el => {
    const number = parseFloat(el.dataset.number || el.textContent)
    if (!isNaN(number)) {
      const words = EnglishConverter(number)
      el.setAttribute('aria-label', words)
      el.setAttribute('title', words)
    }
  })
}

// Usage in HTML:
// <span data-number="1234">1234</span>
// After makeAccessible(): aria-label="one thousand two hundred and thirty-four"
```

### Number Announcement

```javascript
import { EnglishConverter } from 'n2words'

function announceNumber(number) {
  const words = EnglishConverter(number)

  // Create screen reader announcement
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', 'polite')
  announcement.className = 'sr-only'  // Visually hidden
  announcement.textContent = words

  document.body.appendChild(announcement)

  // Remove after announcement
  setTimeout(() => announcement.remove(), 1000)
}

// Usage
announceNumber(42)  // Screen reader says "forty-two"
```

## E-commerce

### Product Quantity Display

```javascript
import { EnglishConverter } from 'n2words'

function describeQuantity(quantity, itemName) {
  const quantityWords = EnglishConverter(quantity)
  const plural = quantity === 1 ? '' : 's'

  return `${quantityWords} ${itemName}${plural}`
}

console.log(describeQuantity(1, 'item'))   // 'one item'
console.log(describeQuantity(5, 'item'))   // 'five items'
console.log(describeQuantity(42, 'widget'))  // 'forty-two widgets'
```

### Shopping Cart Summary

```javascript
import { EnglishConverter } from 'n2words'

class ShoppingCart {
  constructor() {
    this.items = []
  }

  addItem(product, quantity) {
    const existing = this.items.find(i => i.product.id === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      this.items.push({ product, quantity })
    }
  }

  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  getItemCountInWords() {
    const count = this.getItemCount()
    const words = EnglishConverter(count)
    const plural = count === 1 ? '' : 's'
    return `${words} item${plural}`
  }

  getSummary() {
    return {
      count: this.getItemCount(),
      countWords: this.getItemCountInWords(),
      items: this.items
    }
  }
}

const cart = new ShoppingCart()
cart.addItem({ id: 1, name: 'Widget', price: 10 }, 3)
cart.addItem({ id: 2, name: 'Gadget', price: 20 }, 2)

console.log(cart.getItemCountInWords())  // 'five items'
```

## Forms and Validation

### Number Input with Word Display

```javascript
import { EnglishConverter } from 'n2words'

function createNumberInput(id) {
  const input = document.getElementById(id)
  const display = document.createElement('div')
  display.className = 'number-words'

  input.parentNode.insertBefore(display, input.nextSibling)

  input.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value)) {
      display.textContent = EnglishConverter(value)
      display.className = 'number-words valid'
    } else {
      display.textContent = 'Invalid number'
      display.className = 'number-words invalid'
    }
  })
}

// HTML:
// <input type="number" id="amount">
// After createNumberInput('amount'): shows words below input
```

### Form Confirmation

```javascript
import { EnglishConverter } from 'n2words'

function confirmFormData(formData) {
  const confirmation = []

  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'number') {
      confirmation.push({
        field: key,
        value: value,
        words: EnglishConverter(value)
      })
    }
  }

  return confirmation
}

const formData = {
  age: 25,
  quantity: 3,
  price: 100
}

const confirmation = confirmFormData(formData)
confirmation.forEach(item => {
  console.log(`${item.field}: ${item.value} (${item.words})`)
})
// age: 25 (twenty-five)
// quantity: 3 (three)
// price: 100 (one hundred)
```

## Data Visualization

### Chart Label Enhancement

```javascript
import { EnglishConverter } from 'n2words'

function createAccessibleChart(data) {
  return data.map(point => ({
    ...point,
    valueWords: EnglishConverter(point.value),
    ariaLabel: `${point.label}: ${EnglishConverter(point.value)}`
  }))
}

const chartData = [
  { label: 'Jan', value: 100 },
  { label: 'Feb', value: 150 },
  { label: 'Mar', value: 200 }
]

const accessibleData = createAccessibleChart(chartData)
// Adds aria-labels like "Jan: one hundred"
```

## Voice Interfaces

### Voice Command Parser

```javascript
import { EnglishConverter } from 'n2words'

function handleVoiceCommand(command) {
  // Convert numbers in voice commands to digits for processing
  const numbers = command.match(/\b(zero|one|two|three|...|hundred|thousand)\b/gi)

  // For feedback, convert digits back to words
  const response = numbers ? numbers.map(n => {
    // Reverse lookup would go here
    return n
  }) : []

  return response
}
```

### Number Readback

```javascript
import { EnglishConverter } from 'n2words'

class VoiceInterface {
  speak(number) {
    const words = EnglishConverter(number)

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(words)
      window.speechSynthesis.speak(utterance)
    }

    return words
  }

  confirm(action, number) {
    const words = EnglishConverter(number)
    return this.speak(`${action} ${words}`)
  }
}

const voice = new VoiceInterface()
voice.confirm('Transferring', 100)  // Speaks: "Transferring one hundred"
```

## Internationalization

### Multi-Language Price Display

```javascript
import {
  EnglishConverter,
  SpanishConverter,
  FrenchConverter,
  JapaneseConverter,
  SimplifiedChineseConverter
} from 'n2words'

const converters = {
  'en-US': EnglishConverter,
  'es-ES': SpanishConverter,
  'fr-FR': FrenchConverter,
  'ja-JP': JapaneseConverter,
  'zh-CN': SimplifiedChineseConverter
}

function formatPrice(amount, locale) {
  const converter = converters[locale]
  if (!converter) {
    throw new Error(`Locale ${locale} not supported`)
  }

  return converter(Math.floor(amount))
}

console.log(formatPrice(42, 'en-US'))  // 'forty-two'
console.log(formatPrice(42, 'es-ES'))  // 'cuarenta y dos'
console.log(formatPrice(42, 'fr-FR'))  // 'quarante-deux'
console.log(formatPrice(42, 'ja-JP'))  // '四十二'
console.log(formatPrice(42, 'zh-CN'))  // '肆拾贰'
```

### Localized Number Formatter

```javascript
import * as n2words from 'n2words'

class LocalizedFormatter {
  constructor(defaultLocale = 'en-US') {
    this.locale = defaultLocale
    this.converterMap = {
      'en': n2words.EnglishConverter,
      'es': n2words.SpanishConverter,
      'fr': n2words.FrenchConverter,
      'de': n2words.GermanConverter,
      // ... map all locales
    }
  }

  setLocale(locale) {
    this.locale = locale
  }

  format(number) {
    const lang = this.locale.split('-')[0]
    const converter = this.converterMap[lang]

    if (!converter) {
      return number.toString()
    }

    return converter(number)
  }
}

const formatter = new LocalizedFormatter()
formatter.setLocale('es-ES')
console.log(formatter.format(100))  // 'cien'

formatter.setLocale('fr-FR')
console.log(formatter.format(100))  // 'cent'
```

## See Also

- [API Reference](API.md) - Complete API documentation
- [Browser Usage Guide](guides/BROWSER_USAGE.md) - Browser integration
- [Language Development](guides/LANGUAGE_DEVELOPMENT.md) - Add new languages
