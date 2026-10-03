import { ListPatient } from "@/types"
import { createSessions } from "@/utils/sessions/mockCreateSession"

export const listPatientData: ListPatient[] = [
  {
    id: 1,
    image: "/person.jpg",
    firstName: "Anna",
    surName: "Souza",
    typeService: "Pacote",

    startDate: new Date(2026, 1, 12),

    address: {
      telephone: "(99) 99999-9999",
      street: "Rua São Francisco",
      addressNumber: 5,
      noNumber: false,
      neighborhood: "",
      referenceHouse: "Ao lado da madeireira",
    },

    packages: [
      {
        id: "anna-package-1",

        startDate: new Date(2026, 1, 12),

        totalSessions: 10,
        migratedSessions: 6,

        valueSession: 60,
        defaultTime: "16:00",
        fixedWeekDays: ["Terça", "Quinta"],

        current: true,
      },
    ],

    session: createSessions({
      packageId: "anna-package-1",
      startDate: new Date(2026, 1, 12),
      total: 10,
      daysOfWeek: [2, 4],
      typeService: "Pacote",
    }),
  },

  {
    id: 2,
    image: null,
    firstName: "Carlos",
    surName: "Oliveira",
    typeService: "Sessão avulsa",
    startDate: new Date(2026, 1, 10),

    address: {
      telephone: "(88) 98888-1111",
      street: "Rua Central",
      addressNumber: 10,
      noNumber: false,
      neighborhood: "",
      referenceHouse: "Próximo à praça",
    },

    separateSessionInfo: {
      priceSession: 60,
    },

    session: createSessions({
      startDate: new Date(2026, 1, 10),
      total: 1,
      daysOfWeek: [2],
      typeService: "Sessão avulsa",
    }),
  },

  {
    id: 3,
    image: "/person.jpg",
    firstName: "Mariana",
    surName: "Lima",
    typeService: "Pacote",
    startDate: new Date(2026, 1, 1),

    address: {
      telephone: "(77) 97777-2222",
      street: "Rua das Flores",
      addressNumber: 20,
      noNumber: false,
      neighborhood: "",
      referenceHouse: "Em frente ao mercado",
    },

    packages: [
      {
        id: "mariana-package-1",
        startDate: new Date(2025, 5, 1),
        endDate: new Date(2025, 7, 20),
        totalSessions: 5,
        migratedSessions: 20,
        valueSession: 45,
        fixedWeekDays: ["Segunda", "Quarta"],
        defaultTime: "16:00",
        current: false,
      },
      {
        id: "mariana-package-2",
        startDate: new Date(2025, 8, 10),
        endDate: new Date(2025, 11, 5),
        totalSessions: 5,
        migratedSessions: 10,
        valueSession: 45,
        fixedWeekDays: ["Segunda", "Quarta"],
        defaultTime: "16:00",
        current: true,
      },
    ],

    session: [
      ...createSessions({
        packageId: "mariana-package-1",
        startDate: new Date(2025, 5, 1),
        total: 5,
        daysOfWeek: [1, 3],
        typeService: "Pacote",
        forceFinished: true,
      }),

      ...createSessions({
        packageId: "mariana-package-2",
        startDate: new Date(2025, 8, 10),
        total: 5,
        daysOfWeek: [1, 3],
        typeService: "Pacote",
      }),
    ],
  },

  {
    id: 4,
    image: null,
    firstName: "João",
    surName: "Pedro Alves",
    typeService: "Sessão avulsa",
    startDate: new Date(2026, 1, 11),

    address: {
      telephone: "(66) 96666-3333",
      street: "Rua da Paz",
      addressNumber: 12,
      noNumber: false,
      neighborhood: "",
      referenceHouse: "Casa azul",
    },

    separateSessionInfo: {
      priceSession: 60,
    },

    session: createSessions({
      startDate: new Date(2026, 1, 11),
      total: 2,
      daysOfWeek: [3],
      typeService: "Sessão avulsa",
    }),
  },

  {
    id: 5,
    image: "/person.jpg",
    firstName: "Fernanda",
    surName: "Costa",
    typeService: "Pacote",
    startDate: new Date(2026, 1, 11),

    address: {
      telephone: "(55) 95555-4444",
      street: "Rua Primavera",
      addressNumber: 45,
      noNumber: false,
      neighborhood: "",
      referenceHouse: "Perto da escola",
    },

    packages: [
      {
        id: "fernanda-package-1",

        startDate: new Date(2026, 1, 11),

        totalSessions: 6,
        migratedSessions: 6,

        valueSession: 60,
        fixedWeekDays: ["Quarta", "Sexta"],
        defaultTime: "16:00",

        current: true,
      },
    ],

    session: createSessions({
      packageId: "fernanda-package-1",
      startDate: new Date(2026, 1, 11),
      total: 6,
      daysOfWeek: [3, 5],
      typeService: "Pacote",
    }),
  },

  {
    id: 6,
    image: null,
    firstName: "Lucas",
    surName: "Martins",
    typeService: "Sessão avulsa",
    startDate: new Date(2026, 1, 25),

    address: {
      telephone: "(44) 94444-5555",
      street: "Rua Nova",
      addressNumber: 18,
      noNumber: false,
      neighborhood: "",
      referenceHouse: "Ao lado da farmácia",
    },

    separateSessionInfo: {
      priceSession: 60,
    },

    session: createSessions({
      startDate: new Date(2026, 1, 25),
      total: 1,
      daysOfWeek: [2],
      typeService: "Sessão avulsa",
    }),
  },

  {
    id: 7,
    image: "/person.jpg",
    firstName: "Beatriz",
    surName: "Rocha",
    typeService: "Pacote",
    startDate: new Date(2026, 2, 2),

    address: {
      telephone: "(33) 93333-6666",
      street: "Rua Horizonte",
      addressNumber: 90,
      noNumber: false,
      neighborhood: "",
      referenceHouse: "Próximo ao posto",
    },

    packages: [
      {
        id: "beatriz-package-1",

        startDate: new Date(2026, 2, 2),

        totalSessions: 10,
        migratedSessions: 4,

        valueSession: 60,
        fixedWeekDays: ["Segunda", "Quinta"],
        defaultTime: "16:00",

        current: true,
      },
    ],

    session: createSessions({
      packageId: "beatriz-package-1",
      startDate: new Date(2026, 2, 2),
      total: 4,
      daysOfWeek: [1, 4],
      typeService: "Pacote",
    }),
  },

  {
    id: 8,
    image: null,
    firstName: "Gabriel",
    surName: "Fernandes",
    typeService: "Sessão avulsa",
    startDate: new Date(2026, 2, 5),

    address: {
      telephone: "(22) 92222-7777",
      street: "Rua do Sol",
      addressNumber: 30,
      noNumber: false,
      neighborhood: "",
      referenceHouse: "Casa branca",
    },

    separateSessionInfo: {
      priceSession: 60,
    },

    session: createSessions({
      startDate: new Date(2026, 2, 5),
      total: 3,
      daysOfWeek: [4],
      typeService: "Sessão avulsa",
    }),
  },

  {
    id: 9,
    image: "/person.jpg",
    firstName: "Camila",
    surName: "Ribeiro",
    typeService: "Pacote",
    startDate: new Date(2026, 2, 10),

    address: {
      telephone: "(11) 91111-8888",
      street: "Rua Esperança",
      addressNumber: 77,
      noNumber: false,
      neighborhood: "",
      referenceHouse: "Perto da igreja",
    },

    packages: [
      {
        id: "camila-package-1",

        startDate: new Date(2026, 2, 10),

        totalSessions: 10,
        migratedSessions: 8,

        valueSession: 60,
        fixedWeekDays: ["Terça", "Sexta"],
        defaultTime: "16:00",

        current: true,
      },
    ],

    session: createSessions({
      packageId: "camila-package-1",
      startDate: new Date(2026, 2, 10),
      total: 8,
      daysOfWeek: [2],
      typeService: "Pacote",
    }),
  },

  {
    id: 10,
    image: null,
    firstName: "Rafael",
    surName: "Mendes",
    typeService: "Sessão avulsa",
    startDate: new Date(2026, 2, 15),

    address: {
      telephone: "(00) 90000-9999",
      street: "Rua das Acácias",
      addressNumber: 100,
      noNumber: false,
      neighborhood: "",
      referenceHouse: "Ao lado do estádio",
    },

    separateSessionInfo: {
      priceSession: 60,
    },

    session: createSessions({
      startDate: new Date(2026, 2, 15),
      total: 1,
      daysOfWeek: [1],
      typeService: "Sessão avulsa",
    }),
  },
]
