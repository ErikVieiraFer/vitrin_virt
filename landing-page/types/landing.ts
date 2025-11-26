export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface Step {
  number: number;
  icon: string;
  title: string;
  description: string;
  image?: string;
}

export interface Benefit {
  title: string;
  description: string;
  items: string[];
  image: string;
  reverse?: boolean;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  image: string;
  rating: number;
}

export interface PricingPlan {
  name: string;
  price: number;
  priceYearly: number;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

export interface FAQ {
  question: string;
  answer: string;
}
