import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@telegram-apps/telegram-ui/dist/styles.css'
import Script from 'next/script'
import { AppRoot } from '@telegram-apps/telegram-ui'
import 'react-toastify/dist/ReactToastify.css'
import { Suspense } from 'react'
import Loading from './loading'
import NavigationWrapper from './components/NavigationWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Назначь',
	description: 'Мини-приложение для записи клиентов',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang='ru'>
			<head>
				<Script
					strategy='beforeInteractive'
					src='https://telegram.org/js/telegram-web-app.js?56'
				/>
			</head>
			<body className={inter.className}>
				<Suspense fallback={<Loading />}>
					<AppRoot>
						<div>{children}</div>
					</AppRoot>
				</Suspense>
				<NavigationWrapper />
			</body>
		</html>
	)
}
