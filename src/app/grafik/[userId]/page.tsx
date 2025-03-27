import Container from '@/app/components/Container'
import TimeSlotPicker from './client'
import { Suspense } from 'react'
import { getSpecialistByUseId } from '@/app/actions/getSpecialistByUserId'
import { getGrafikById } from '@/app/actions/getGrafikById'
import { AppRoot } from '@telegram-apps/telegram-ui'

interface TimeSlotsProps {
	params: {
		userId: string
	}
}

// Компонент загрузки
const LoadingState = () => (
	<div className='p-4'>
		<div className='animate-pulse space-y-4'>
			<div className='h-12 bg-gray-200 rounded'></div>
			<div className='space-y-3'>
				<div className='h-4 bg-gray-200 rounded w-3/4'></div>
				<div className='h-4 bg-gray-200 rounded w-1/2'></div>
			</div>
			<div className='grid grid-cols-7 gap-2'>
				{[...Array(7)].map((_, i) => (
					<div key={i} className='h-8 bg-gray-200 rounded'></div>
				))}
			</div>
		</div>
	</div>
)

async function GrafikData({ userId }: { userId: string }) {
	const [user, grafik] = await Promise.all([
		getSpecialistByUseId(userId),
		getGrafikById(userId),
	])

	if (!user) {
		return <div className='p-4 text-red-500'>Пользователь не найден</div>
	}

	return <TimeSlotPicker specialistId={user?.userId} grafik={grafik} />
}

export default function TimeSlots({ params }: TimeSlotsProps) {
	return (
		<AppRoot>
			<Suspense fallback={<LoadingState />}>
				<GrafikData userId={params.userId} />
			</Suspense>
		</AppRoot>
	)
}
