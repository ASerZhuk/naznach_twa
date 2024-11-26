'use client'

import { AppRoot, List } from '@telegram-apps/telegram-ui'
import React from 'react'

interface ContainerProps {
	children: React.ReactNode
}

const Container: React.FC<ContainerProps> = ({ children }) => {
	return (
		<>
			<AppRoot>
				<List
					style={{
						background: 'var(--tgui--secondary_bg_color)',
					}}
				>
					<div className='max-w-[2520px] min-h-screen mx-auto xl:px-20 md:px-10 sm:px-2 px-4'>
						{children}
					</div>
				</List>
			</AppRoot>
		</>
	)
}

export default Container
