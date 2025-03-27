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
					<div>{children}</div>
				</List>
			</AppRoot>
		</>
	)
}

export default Container
