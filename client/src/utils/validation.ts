const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type SignupErrors = Partial<Record<keyof SignupFormValues, string>>;

export function validateSignup({
  name,
  email,
  password,
  confirmPassword,
}: SignupFormValues): SignupErrors {
  const errors: SignupErrors = {};

  if (!name.trim()) {
    errors.name = 'Name is required';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export type LoginErrors = Partial<Record<keyof LoginFormValues, string>>;

export function validateLogin({
  email,
  password,
}: LoginFormValues): LoginErrors {
  const errors: LoginErrors = {};

  if (!email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return errors;
}

export interface EventFormValues {
  title: string;
  description: string;
  venue: string;
  startsAt: string;
  capacity: string;
  price: string;
}

export type EventErrors = Partial<Record<keyof EventFormValues, string>>;

export function validateEventForm({
  title,
  description,
  venue,
  startsAt,
  capacity,
  price,
}: EventFormValues): EventErrors {
  const errors: EventErrors = {};

  if (!title.trim()) errors.title = 'Title is required';
  else if (title.trim().length < 3) errors.title = 'Title must be at least 3 characters';

  if (!description.trim()) errors.description = 'Description is required';
  else if (description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }

  if (!venue.trim()) errors.venue = 'Venue is required';

  if (!startsAt) errors.startsAt = 'Date and time are required';
  else if (new Date(startsAt).getTime() <= Date.now()) {
    errors.startsAt = 'Pick a date in the future';
  }

  const capacityNumber = Number(capacity);

  if (capacity === '') errors.capacity = 'Capacity is required';
  else if (!Number.isInteger(capacityNumber) || capacityNumber < 1) {
    errors.capacity = 'Capacity must be a whole number of at least 1';
  }

  const priceNumber = Number(price);

  if (price === '') errors.price = 'Price is required (use 0 for free events)';
  else if (Number.isNaN(priceNumber) || priceNumber < 0) {
    errors.price = 'Price cannot be negative';
  }

  return errors;
}