import { ListPatient } from "@/types"
import { createSessions } from "@/utils/mockCreateSession"
import { MapPinHouse, Phone, Send } from "lucide-react"

export const listPatientData: ListPatient[] = [
  {
    id: 1,
    image: "/person.png",
    name: "Anna Souza",
    typeService: "Pacote",
    startDate: new Date(2026, 1, 12),
    daysOfWeek: [2, 4],

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

    sessionPackageInfo: {
      sessao: {
        label: "Sessões feitas",
        value: 4,
      },
      restante: {
        label: "Sessões restantes",
        value: 2,
      },
      preco_sessao: {
        label: "Preço da sessão",
        value: 60,
      },
      total: {
        label: "Total",
        value: 6,
      },
    },

    session: createSessions({
      startDate: new Date(2026, 1, 12),
      total: 6,
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
    daysOfWeek: [2],

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
      sessao_feita: {
        label: "Sessões feitas",
        value: 0,
      },
      sessao_agendada: {
        label: "Sessões agendada",
        value: 1,
      },
      preco_sessao: {
        label: "Preço da sessão",
        value: 60,
      },
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
    daysOfWeek: [1, 3],

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

    sessionPackageInfo: {
      sessao: {
        label: "Sessões feitas",
        value: 3,
      },
      restante: {
        label: "Sessões restantes",
        value: 3,
      },
      total: {
        label: "Total no pacote atual",
        value: 6,
      },
      preco_sessao: {
        label: "Preço da sessão",
        value: 60,
      },
    },

    session: createSessions({
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
    daysOfWeek: [3],

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
      sessao_feita: {
        label: "Sessão feita",
        value: 0,
      },
      sessao_agendada: {
        label: "Sessão agendada",
        value: 1,
      },
      preco_sessao: {
        label: "Preço da sessão",
        value: 60,
      },
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
    daysOfWeek: [3, 5],

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

    sessionPackageInfo: {
      sessao: {
        label: "Sessões feitas",
        value: 5,
      },
      restante: {
        label: "Sessões restantes",
        value: 1,
      },
      total: {
        label: "Total",
        value: 6,
      },
      preco_sessao: {
        label: "Preço da sessão",
        value: 60,
      },
    },

    session: createSessions({
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
    daysOfWeek: [2],

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
      sessao_feita: {
        label: "Sessão feita",
        value: 0,
      },
      sessao_agendada: {
        label: "Sessão agendada",
        value: 1,
      },
      preco_sessao: {
        label: "Preço da sessão",
        value: 60,
      },
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
    daysOfWeek: [1, 4],

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

    sessionPackageInfo: {
      sessao: {
        label: "Sessões feitas",
        value: 2,
      },
      restante: {
        label: "Sessões restantes",
        value: 4,
      },
      total: {
        label: "Total",
        value: 6,
      },
      preco_sessao: {
        label: "Preço da sessão",
        value: 60,
      },
    },

    session: createSessions({
      startDate: new Date(2026, 2, 2),
      total: 6,
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
    daysOfWeek: [4],

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
      sessao_feita: {
        label: "Sessão feita",
        value: 0,
      },
      sessao_agendada: {
        label: "Sessão agendada",
        value: 1,
      },
      preco_sessao: {
        label: "Preço da sessão",
        value: 60,
      },
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
    daysOfWeek: [2, 5],

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

    sessionPackageInfo: {
      sessao: {
        label: "Sessões feitas",
        value: 0,
      },
      restante: {
        label: "Sessões restantes",
        value: 6,
      },
      total: {
        label: "Total",
        value: 6,
      },
      preco_sessao: {
        label: "Preço da sessão",
        value: 60,
      },
    },

    session: createSessions({
      startDate: new Date(2026, 2, 10),
      total: 6,
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
    daysOfWeek: [1],

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
      sessao_feita: {
        label: "Sessão feita",
        value: 0,
      },
      sessao_agendada: {
        label: "Sessão agendada",
        value: 1,
      },
      preco_sessao: {
        label: "Preço da sessão",
        value: 60,
      },
    },

    session: createSessions({
      startDate: new Date(2026, 2, 15),
      total: 1,
      daysOfWeek: [1],
      typeService: "Sessão avulsa",
    }),
  },
]
