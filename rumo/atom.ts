"use client"
import { atom } from "jotai"
import { io } from "socket.io-client"

export interface Card {
  value: string
  type: string
}

export interface Player {
  username: string
  hand: Card[]
  id: string // Add unique identifier
  wins: number // Track wins per player
  isReady: boolean // Track if player is ready to start
}

export interface GameState {
  drawDeck: Card[]
  discardDeck: Card[]
  currentPlayerIndex: number
  direction: number
  winners: string[]
  status: 'waiting' | 'playing' | 'finished' // Track game status
  roundNumber: number // Track current round
}

export interface Room {
  roomId: number
  players: Player[]
  maxPlayers: number
  gameState: GameState
  createdAt: Date
  gameHistory: GameHistory[]
}

export interface GameHistory {
  timestamp: Date
  winner: string
  players: {
    username: string
    position: number // Final position in game
  }[]
}

// Player statistics
export interface PlayerStats {
  totalGames: number
  wins: number
  winRate: number
  averagePosition: number
  lastPlayed: Date
}

// Atoms
export const roomStateAtom = atom<Room | null>(null)
export const playerAtom = atom<Player | null>(null)
export const playerStatsAtom = atom<PlayerStats>({
  totalGames: 0,
  wins: 0,
  winRate: 0,
  averagePosition: 0,
  lastPlayed: new Date()
})

// Socket initialization with error handling
export const socket = io(process.env.NEXT_PUBLIC_API_URL, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 3,
  reconnectionDelay: 1000,
  autoConnect: true,
})