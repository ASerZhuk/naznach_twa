'use client'

import { Button } from '@telegram-apps/telegram-ui'
import { useEffect } from 'react'

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		console.error(error)
	}, [error])

	return (
		<div className='flex flex-col items-center justify-center h-screen'>
			<h2 className='text-lg font-medium mb-4'>Что-то пошло не так!</h2>
			<Button onClick={() => reset()}>Попробовать снова</Button>
		</div>
	)
}
