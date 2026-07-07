// Role color definitions for the Blocks chunk editor in Library.
// SOURCE OF TRUTH: src/lib/roles.js in dmnfang/blocks repo.
// If you recolor roles, update BOTH files — this one drives the editor palette
// and the blocks repo drives the game. They must stay in sync.

export const ROLES = [
  {
    key: 'subject',
    label: 'Subject',
    main: '#E2606F',
    tint: '#FCEDEE',
    dark: '#B94553',
  },
  {
    key: 'verb',
    label: 'Verb',
    main: '#4AA875',
    tint: '#EAF5EF',
    dark: '#357E56',
  },
  {
    key: 'noun',
    label: 'Noun',
    main: '#E09A2E',
    tint: '#FBF3E2',
    dark: '#A9721B',
  },
  {
    key: 'wh',
    label: 'Question',
    main: '#4E9FD6',
    tint: '#EAF4FB',
    dark: '#37749E',
  },
  {
    key: 'conn',
    label: 'Connector',
    main: '#9B7FD4',
    tint: '#F2EEFA',
    dark: '#7057A3',
  },
  {
    key: 'punct',
    label: 'Punct',
    main: '#8F887C',
    tint: '#F1EFEA',
    dark: '#6B655B',
  },
]

export const ROLE_MAP = Object.fromEntries(ROLES.map(r => [r.key, r]))