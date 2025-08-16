const ADMIN_CREDENTIALS = {
  email: "Vinroot@admin1",
  password: "vinrootdevmith",
}

export const adminAuth = {
  login: (email: string, password: string): boolean => {
    return email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password
  },

  isAdmin: (email: string): boolean => {
    return email === ADMIN_CREDENTIALS.email
  },
}
