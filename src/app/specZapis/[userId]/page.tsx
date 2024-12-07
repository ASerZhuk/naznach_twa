import React from 'react'
import SpecZapis from './client'
import { getSpecialistByUseId } from '@/app/actions/getSpecialistByUserId'
import { getGrafikById } from '@/app/actions/getGrafikById'
import Container from '@/app/components/Container'
import { AppRoot } from '@telegram-apps/telegram-ui'

interface specZapisPageProps {
	params: {
		userId: string
	}
}

const page = async ({ params }: specZapisPageProps) => {
	const user = await getSpecialistByUseId(params.userId)
	const grafik = await getGrafikById(params.userId)
	if (!user) {
		return <div>Пользователь не найден</div>
	}

	return (
		<Container>
			<AppRoot>
				<SpecZapis user={user} garfik={grafik ?? []} />
			</AppRoot>
		</Container>
	)
}

export default page
