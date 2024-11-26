'use client'

import Container from '@/app/components/Container'
import {
	Cell,
	Headline,
	Input,
	List,
	Section,
	Textarea,
} from '@telegram-apps/telegram-ui'
import { MainButton } from '@vkruglikov/react-telegram-web-app'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { IoSettingsSharp } from 'react-icons/io5'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface ClientProps {
	user: {
		lastName: string | null
		firstName: string | null
		username: string | null
		userId: string
		price: string | null
		phone: string | null
		address: string | null
		category: string | null
		description: string | null
	}
}

const ClientForm = ({ user }: ClientProps) => {
	const router = useRouter()
	const [formData, setFormData] = useState({
		firstName: user.firstName || '',
		lastName: user.lastName || '',
		price: user.price || '',
		phone: user.phone || '',
		address: user.address || '',
		category: user.category || '',
		description: user.description || '',
		userId: user.userId,
	})

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target
		setFormData({
			...formData,
			[name]: value,
		})
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		try {
			const response = await fetch('/api/profile', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			})

			if (response.ok) {
				toast.success('Профиль успешно обновлен')
				setTimeout(() => {
					router.replace(`/profile/${user.userId}`)
				}, 1000)
			} else {
				toast.error('Ошибка при обновлении профиля')
			}
		} catch (error) {
			toast.error('Произошла ошибка')
		}
	}

	useEffect(() => {
		setFormData({
			firstName: user.firstName || '',
			lastName: user.lastName || '',
			price: user.price || '',
			phone: user.phone || '',
			address: user.address || '',
			category: user.category || '',
			description: user.description || '',
			userId: user.userId,
		})
	}, [user]) // Перезагрузка данных формы при изменении user

	useEffect(() => {
		const tg = window.Telegram.WebApp
		tg.ready()
		tg.BackButton.show
		tg.BackButton.onClick(() => router.push(`/`))
	}, [])

	return (
		<>
			<MainButton
				text='Сохранить профиль'
				onClick={() =>
					handleSubmit(
						new Event('submit') as unknown as React.FormEvent<HTMLFormElement>
					)
				}
			></MainButton>
			<Container>
				<ToastContainer />
				<List>
					<Section className='pt-2'>
						<Cell
							before={
								<IoSettingsSharp
									size={32}
									className='bg-blue-500 p-1 rounded-lg'
									color='white'
								/>
							}
							subtitle='Добавляйте и редактируйте данные'
						>
							<Headline weight='2'>Мой профиль</Headline>
						</Cell>
						<form onSubmit={handleSubmit}>
							<Input
								status='focused'
								header='Ваше имя'
								id='firstName'
								name='firstName'
								type='text'
								placeholder='Иван'
								value={formData.firstName}
								onChange={handleChange}
							/>
							<Input
								status='focused'
								header='Ваша фамилия'
								id='lastName'
								name='lastName'
								type='text'
								placeholder='Иванов'
								value={formData.lastName}
								onChange={handleChange}
							/>
							<Input
								status='focused'
								header='Стоимость услуги (руб.)'
								id='price'
								name='price'
								type='text'
								placeholder='1000'
								value={formData.price}
								onChange={handleChange}
							/>
							<Input
								status='focused'
								header='Номер телефона'
								id='phone'
								name='phone'
								type='tel'
								placeholder='+79202002020'
								value={formData.phone}
								onChange={handleChange}
							/>
							<Input
								status='focused'
								header='Категория услуги'
								id='category'
								name='category'
								type='text'
								placeholder='Парикмахер'
								value={formData.category}
								onChange={handleChange}
							/>
							<Input
								status='focused'
								header='Адрес оказания услуги'
								id='address'
								name='address'
								type='text'
								placeholder='г. Москва, ул. Пушкина д.15, оф.1'
								value={formData.address}
								onChange={handleChange}
							/>
							<Textarea
								status='focused'
								header='Описание услуги'
								id='description'
								name='description'
								placeholder='Расскажите о себе'
								value={formData.description}
								onChange={handleChange}
								className='mt-4'
							/>
						</form>
					</Section>
				</List>
			</Container>
		</>
	)
}

export default ClientForm
