export async function getUserById(userId: string) {
	try {
		const response = await fetch('/api/getUser', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ userId }),
		})

		if (!response.ok) {
			throw new Error('Ошибка загрузки данных пользователя')
		}

		const data = await response.json()
		return data
	} catch (error) {
		console.error('Ошибка при получении данных пользователя:', error)
		return null
	}
}
