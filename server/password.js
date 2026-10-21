import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

export const passwordRules = (password) => typeof password === 'string' && password.length >= 10

export async function promptPassword(label = 'Password: ') {
  const terminal = readline.createInterface({ input, output })
  const password = await terminal.question(label)
  terminal.close()
  if (!passwordRules(password)) throw new Error('Password must be at least 10 characters')
  return password
}
