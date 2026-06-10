import { ListPatient } from "@/types"
import { createSessions } from "@/utils/sessions/mockCreateSession"
import { MapPinHouse, Phone, Send } from "lucide-react"

export const listPatientData: ListPatient[] = [
  {
    id: 1,
    image: "/person.png",
    name: "Anna Souza",
    typeService: "Pacote",

    startDate: new Date(2026, 1, 12),

    contactInfo: {
      tel: {
        Icon: Phone,
        label: "Telefone",
        value: "(99) 99999-9999",
      },
      address: {
        Icon: MapPinHouse,
        label: "Endereço",
        value: "Rua São Francisco, 05",
      },
      reference: {
        Icon: Send,
        label: "Referência",
        value: "Ao lado da madeireira",
      },
    },

    packages: [
      {
        id: "anna-package-1",

        startDate: new Date(2026, 1, 12),

        totalSessions: 10,
        migratedSessions: 6,

        valueSession: 60,
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
    name: "Carlos Oliveira",
    typeService: "Sessão avulsa",
    startDate: new Date(2026, 1, 10),

    contactInfo: {
      tel: {
        Icon: Phone,
        label: "Telefone",
        value: "(88) 98888-1111",
      },
      address: {
        Icon: MapPinHouse,
        label: "Endereço",
        value: "Rua Central, 10",
      },
      reference: {
        Icon: Send,
        label: "Referência",
        value: "Próximo à praça",
      },
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
    image: "/person.png",
    name: "Mariana Lima",
    typeService: "Pacote",
    startDate: new Date(2026, 1, 1),

    contactInfo: {
      tel: {
        Icon: Phone,
        label: "Telefone",
        value: "(77) 97777-2222",
      },
      address: {
        Icon: MapPinHouse,
        label: "Endereço",
        value: "Rua das Flores, 20",
      },
      reference: {
        Icon: Send,
        label: "Referência",
        value: "Em frente ao mercado",
      },
    },

    packages: [
      {
        id: "mariana-package-1",
        startDate: new Date(2025, 5, 1),
        endDate: new Date(2025, 7, 20),
        totalSessions: 20,
        migratedSessions: 20,
        valueSession: 45,
        fixedWeekDays: ["Segunda", "Quarta"],
        current: false,
      },
      {
        id: "mariana-package-2",
        startDate: new Date(2025, 8, 10),
        endDate: new Date(2025, 11, 5),
        totalSessions: 20,
        migratedSessions: 10,
        valueSession: 45,
        fixedWeekDays: ["Segunda", "Quarta"],
        current: true,
      },
    ],

    session: createSessions({
      packageId: "mariana-package-2",
      startDate: new Date(2026, 1, 1),
      total: 10,
      daysOfWeek: [1, 3],
      typeService: "Pacote",
    }),
  },

  {
    id: 4,
    image: null,
    name: "João Pedro Alves",
    typeService: "Sessão avulsa",
    startDate: new Date(2026, 1, 11),

    contactInfo: {
      tel: {
        Icon: Phone,
        label: "Telefone",
        value: "(66) 96666-3333",
      },
      address: {
        Icon: MapPinHouse,
        label: "Endereço",
        value: "Rua da Paz, 12",
      },
      reference: {
        Icon: Send,
        label: "Referência",
        value: "Casa azul",
      },
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
    image: "/person.png",
    name: "Fernanda Costa",
    typeService: "Pacote",
    startDate: new Date(2026, 1, 11),

    contactInfo: {
      tel: {
        Icon: Phone,
        label: "Telefone",
        value: "(55) 95555-4444",
      },
      address: {
        Icon: MapPinHouse,
        label: "Endereço",
        value: "Rua Primavera, 45",
      },
      reference: {
        Icon: Send,
        label: "Referência",
        value: "Perto da escola",
      },
    },

    packages: [
      {
        id: "fernanda-package-1",

        startDate: new Date(2026, 1, 11),

        totalSessions: 6,
        migratedSessions: 6,

        valueSession: 60,
        fixedWeekDays: ["Quarta", "Sexta"],

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
    name: "Lucas Martins",
    typeService: "Sessão avulsa",
    startDate: new Date(2026, 1, 25),

    contactInfo: {
      tel: {
        Icon: Phone,
        label: "Telefone",
        value: "(44) 94444-5555",
      },
      address: {
        Icon: MapPinHouse,
        label: "Endereço",
        value: "Rua Nova, 18",
      },
      reference: {
        Icon: Send,
        label: "Referência",
        value: "Ao lado da farmácia",
      },
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
    image: "/person.png",
    name: "Beatriz Rocha",
    typeService: "Pacote",
    startDate: new Date(2026, 2, 2),

    contactInfo: {
      tel: {
        Icon: Phone,
        label: "Telefone",
        value: "(33) 93333-6666",
      },
      address: {
        Icon: MapPinHouse,
        label: "Endereço",
        value: "Rua Horizonte, 90",
      },
      reference: {
        Icon: Send,
        label: "Referência",
        value: "Próximo ao posto",
      },
    },

    packages: [
      {
        id: "beatriz-package-1",

        startDate: new Date(2026, 2, 2),

        totalSessions: 10,
        migratedSessions: 4,

        valueSession: 60,
        fixedWeekDays: ["Segunda", "Quinta"],

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
    name: "Gabriel Fernandes",
    typeService: "Sessão avulsa",
    startDate: new Date(2026, 2, 5),

    contactInfo: {
      tel: {
        Icon: Phone,
        label: "Telefone",
        value: "(22) 92222-7777",
      },
      address: {
        Icon: MapPinHouse,
        label: "Endereço",
        value: "Rua do Sol, 30",
      },
      reference: {
        Icon: Send,
        label: "Referência",
        value: "Casa branca",
      },
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
    image: "/person.png",
    name: "Camila Ribeiro",
    typeService: "Pacote",
    startDate: new Date(2026, 2, 10),

    contactInfo: {
      tel: {
        Icon: Phone,
        label: "Telefone",
        value: "(11) 91111-8888",
      },
      address: {
        Icon: MapPinHouse,
        label: "Endereço",
        value: "Rua Esperança, 77",
      },
      reference: {
        Icon: Send,
        label: "Referência",
        value: "Perto da igreja",
      },
    },

    packages: [
      {
        id: "camila-package-1",

        startDate: new Date(2026, 2, 10),

        totalSessions: 10,
        migratedSessions: 8,

        valueSession: 60,
        fixedWeekDays: ["Terça", "Sexta"],

        current: true,
      },
    ],

    session: createSessions({
      packageId: "camila-package-1",
      startDate: new Date(2026, 2, 10),
      total: 8,
      daysOfWeek: [2, 5],
      typeService: "Pacote",
    }),
  },

  {
    id: 10,
    image: null,
    name: "Rafael Mendes",
    typeService: "Sessão avulsa",
    startDate: new Date(2026, 2, 15),

    contactInfo: {
      tel: {
        Icon: Phone,
        label: "Telefone",
        value: "(00) 90000-9999",
      },
      address: {
        Icon: MapPinHouse,
        label: "Endereço",
        value: "Rua das Acácias, 100",
      },
      reference: {
        Icon: Send,
        label: "Referência",
        value: "Ao lado do estádio",
      },
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
