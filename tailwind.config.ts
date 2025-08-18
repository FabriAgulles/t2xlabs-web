import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				// Futuristic color system
				'space-black': 'hsl(var(--space-black))',
				'deep-space': 'hsl(var(--deep-space))',
				'cyber-blue': 'hsl(var(--cyber-blue))',
				'matrix-green': 'hsl(var(--matrix-green))',
				'neon-cyan': 'hsl(var(--neon-cyan))',
				'plasma-purple': 'hsl(var(--plasma-purple))',
				'energy-yellow': 'hsl(var(--energy-yellow))',
				
				// System colors
				border: 'hsl(var(--input-border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
					border: 'hsl(var(--card-border))'
				},
				success: 'hsl(var(--success))',
				warning: 'hsl(var(--warning))',
				destructive: 'hsl(var(--destructive))'
			},
			backgroundImage: {
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-cosmic': 'var(--gradient-cosmic)',
				'gradient-matrix': 'var(--gradient-matrix)',
				'gradient-card': 'var(--gradient-card)'
			},
			boxShadow: {
				'glow-cyan': 'var(--glow-cyan)',
				'glow-matrix': 'var(--glow-matrix)',
				'glow-plasma': 'var(--glow-plasma)',
				'elevated': 'var(--shadow-elevated)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				// Enhanced animations for futuristic effects
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-up': {
					'0%': { opacity: '0', transform: 'translateY(50px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'glow-pulse': {
					'0%, 100%': { boxShadow: '0 0 20px hsl(var(--neon-cyan) / 0.3)' },
					'50%': { boxShadow: '0 0 40px hsl(var(--neon-cyan) / 0.6)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'rotate-slow': {
					'from': { transform: 'rotate(0deg)' },
					'to': { transform: 'rotate(360deg)' }
				},
				'counter-up': {
					'0%': { opacity: '0', transform: 'scale(0.8)' },
					'50%': { opacity: '0.5', transform: 'scale(1.1)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.3s ease-out',
				'accordion-up': 'accordion-up 0.3s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'slide-up': 'slide-up 0.8s ease-out',
				'scale-in': 'scale-in 0.5s ease-out',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'rotate-slow': 'rotate-slow 10s linear infinite',
				'counter-up': 'counter-up 0.8s ease-out forwards'
			},
			fontFamily: {
				'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
				'display': ['Inter', 'system-ui', 'sans-serif']
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
