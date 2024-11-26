import { Telegram } from '@twa-dev/types'
import { Eruda } from 'eruda'

export {}

declare global {
	interface Window {
		Telegram: Telegram
		eruda: Eruda
	}
}
