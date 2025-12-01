
import { Caregiver, Review, Appointment, Notification, User, Client, Service, Conversation, Admin, Wallet, SystemSettings, ContentPageData } from './types';

const defaultServices: Service[] = [
    { id: 's1', name: 'Diário', icon: '☀️', price: 180, description: '10 horas de cuidado personalizado durante o dia.' },
    { id: 's2', name: 'Noturno', icon: '🌙', price: 200, description: 'Monitoramento e cuidados essenciais durante a noite.' },
    { id: 's3', name: '24h', icon: '⏰', price: 350, description: 'Cuidado integral e dedicação exclusiva, dia e noite.' },
    { id: 's4', name: 'Folga', icon: '🍃', price: 150, description: 'Suporte temporário para que a família possa descansar.' },
    { id: 's5', name: 'Companhia', icon: '☕', price: 120, description: 'Companhia para conversas, atividades e passeios.' },
];

export const initialSystemSettings: SystemSettings = {
    appName: '99 Cuidar',
    logo: '💙',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    maintenanceMode: false
};

export const initialContentPages: ContentPageData[] = [
    {
        slug: 'about',
        title: 'Sobre a 99Cuidar',
        content: `Na 99Cuidar, nossa missão é revolucionar o setor de cuidados, oferecendo uma plataforma segura, eficiente e humana que conecta cuidadores profissionais a famílias que precisam de suporte.\n\nAcreditamos que todos merecem acesso a cuidados de qualidade, com dignidade e respeito, e trabalhamos incansavelmente para tornar isso uma realidade através da tecnologia.`,
        lastUpdated: new Date().toISOString()
    },
    {
        slug: 'privacy',
        title: 'Política de Privacidade',
        content: `A sua privacidade é importante para nós. É política da 99Cuidar respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar em nosso site e outras mídias que possuímos e operamos.\n\nSolicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento.`,
        lastUpdated: new Date().toISOString()
    },
    {
        slug: 'terms',
        title: 'Termos de Uso',
        content: `Ao acessar e usar a plataforma 99Cuidar, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com estes termos, não deverá usar a Plataforma.\n\nA 99Cuidar é uma plataforma de tecnologia que conecta indivíduos que buscam serviços de cuidado com profissionais independentes.`,
        lastUpdated: new Date().toISOString()
    },
    {
        slug: 'security',
        title: 'Segurança Total',
        content: `Na 99Cuidar, entendemos que a confiança é a base de qualquer relação de cuidado. Por isso, implementamos um processo de verificação rigoroso para garantir que apenas os profissionais mais qualificados e confiáveis façam parte da nossa plataforma.\n\nO selo Verificado Pro é a garantia de que o cuidador passou com sucesso por todas as etapas essenciais de nossa verificação.`,
        lastUpdated: new Date().toISOString()
    }
];

export const sampleReviews: { [key: number]: Review[] } = {
    1: [
        { id: 1, author: 'Família Almeida', authorPhoto: '👨‍👩‍👧', rating: 5, comment: 'Netha é uma profissional excepcional! Cuidou da minha mãe com muito carinho e competência. Recomendo de olhos fechados.', date: '2024-07-15', caregiverId: 1, caregiverName: 'Netha Pereira' },
        { id: 2, author: 'Carlos Souza', authorPhoto: '👨‍🦳', rating: 5, comment: 'Profissionalismo impecável. Sempre pontual e atenciosa. A saúde do meu pai melhorou muito com os cuidados dela.', date: '2024-06-28', caregiverId: 1, caregiverName: 'Netha Pereira' },
    ],
    25: [
        { id: 3, author: 'Beatriz Lima', authorPhoto: '👩', rating: 5, comment: 'Mariana é simplesmente a melhor. Sua experiência e dedicação são visíveis em cada detalhe. Nos sentimos muito seguros com ela.', date: '2024-07-20', caregiverId: 25, caregiverName: 'Mariana Teixeira' },
    ]
};

const caregiversList: Omit<Caregiver, 'role' | 'notificationPreferences' | 'status' | 'appointments' | 'wallet'>[] = [
    {
        id: 1, name: "Netha Pereira", email: "netha@99cuidar.com", city: "São Luís, MA", experience: "10+", specializations: ["alzheimer", "diabetes"], certifications: ["Primeiros Socorros", "Gerontologia"], availability: "today", rating: 4.9, reviewsCount: 47, reviews: sampleReviews[1] || [], bio: "Cuidadora especializada com mais de 12 anos de experiência em cuidados com idosos. Formada em técnico de enfermagem e especializada em Alzheimer. Minha abordagem é centrada no paciente, buscando sempre oferecer não apenas o cuidado técnico necessário, mas também conforto, dignidade e companhia.", phone: "(98) 98887-9009", services: defaultServices, photo: "👩‍⚕️", cover: { type: 'gradient', value: 'bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200' }, verified: true, online: true, responseTime: "15 min", completedJobs: 280, unavailableDates: [new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0]], security: { backgroundCheck: 'completed', idVerification: 'completed', insurance: true, insurancePolicy: 'AP-123456789' }, socialMedia: { instagram: '#', facebook: '#', linkedin: '#', whatsapp: '#', },
    },
    {
        id: 2, name: "João Silva", email: "joao.silva@example.com", city: "Rio Branco, AC", experience: "3-5", specializations: ["parkinson", "mobilidade-reduzida"], certifications: ["Cuidador de Idosos"], availability: "this_week", rating: 4.8, reviewsCount: 15, reviews: [], bio: "Cuidador dedicado com 4 anos de experiência, focado em promover a independência e o bem-estar dos idosos. Paciente e atencioso.", phone: "(68) 91234-5678", services: defaultServices, photo: "👨‍⚕️", cover: { type: 'gradient', value: 'bg-gradient-to-br from-green-200 to-teal-200' }, verified: true, online: false, responseTime: "1 hora", completedJobs: 50, security: { backgroundCheck: 'completed', idVerification: 'pending', insurance: true },
    },
    {
        id: 3, name: "Maria Santos", email: "maria.santos@example.com", city: "Maceió, AL", experience: "6-10", specializations: ["pos-cirurgico", "diabetes"], certifications: ["Técnico de Enfermagem"], availability: "next_week", rating: 4.9, reviewsCount: 32, reviews: [], bio: "Técnica de enfermagem com 8 anos de experiência em ambiente hospitalar e domiciliar. Especialista em cuidados pós-operatórios.", phone: "(82) 98765-4321", services: defaultServices, photo: "👩‍🔬", cover: { type: 'gradient', value: 'bg-gradient-to-br from-cyan-200 to-blue-200' }, verified: true, online: true, responseTime: "20 min", completedJobs: 120, security: { backgroundCheck: 'completed', idVerification: 'completed', insurance: true },
    },
    {
        id: 4, name: "José Oliveira", email: "jose.oliveira@example.com", city: "Macapá, AP", experience: "0-2", specializations: ["companhia", "mobilidade-reduzida"], certifications: [], availability: "today", rating: 4.5, reviewsCount: 5, reviews: [], bio: "Iniciando na carreira de cuidador, mas com muita vontade de aprender e ajudar. Sou ótimo para companhia, leitura e atividades leves.", phone: "(96) 99876-5432", services: defaultServices, photo: "👨‍🏫", cover: { type: 'gradient', value: 'bg-gradient-to-br from-orange-200 to-yellow-200' }, verified: false, online: true, responseTime: "10 min", completedJobs: 8, security: { backgroundCheck: 'pending', idVerification: 'pending', insurance: false },
    },
    {
        id: 5, name: "Ana Costa", email: "ana.costa@example.com", city: "Manaus, AM", experience: "10+", specializations: ["demencia", "cuidados-paliativos"], certifications: ["Gerontologia", "Cuidados Paliativos"], availability: "this_week", rating: 5.0, reviewsCount: 60, reviews: [], bio: "Gerontóloga com vasta experiência em cuidados complexos, incluindo demência e suporte paliativo. Meu foco é o conforto e a dignidade do paciente.", phone: "(92) 98765-1234", services: defaultServices, photo: "👩‍💼", cover: { type: 'gradient', value: 'bg-gradient-to-br from-red-200 to-pink-200' }, verified: true, online: false, responseTime: "2 horas", completedJobs: 250, security: { backgroundCheck: 'completed', idVerification: 'completed', insurance: true },
    },
    {
        id: 6, name: "Marcos Souza", email: "marcos.souza@example.com", city: "Salvador, BA", experience: "3-5", specializations: ["alzheimer", "parkinson"], certifications: ["Primeiros Socorros"], availability: "today", rating: 4.7, reviewsCount: 22, reviews: [], bio: "Cuidador atencioso e proativo, com experiência em doenças neurodegenerativas. Gosto de criar rotinas que estimulem a mente e o corpo.", phone: "(71) 91234-8765", services: defaultServices, photo: "👨‍🎨", cover: { type: 'gradient', value: 'bg-gradient-to-br from-lime-200 to-green-200' }, verified: true, online: true, responseTime: "30 min", completedJobs: 85, security: { backgroundCheck: 'completed', idVerification: 'completed', insurance: false },
    },
    {
        id: 7, name: "Lúcia Lima", email: "lucia.lima@example.com", city: "Fortaleza, CE", experience: "6-10", specializations: ["diabetes", "mobilidade-reduzida"], certifications: ["Nutrição para Idosos"], availability: "next_week", rating: 4.8, reviewsCount: 41, reviews: [], bio: "Com 7 anos de experiência, sou especialista em controle de diabetes e auxílio na mobilidade. Gosto de preparar refeições saudáveis e saborosas.", phone: "(85) 98765-5678", services: defaultServices, photo: "👩‍🍳", cover: { type: 'color', value: '#FBCFE8' }, verified: true, online: true, responseTime: "45 min", completedJobs: 150, security: { backgroundCheck: 'completed', idVerification: 'completed', insurance: true },
    },
    {
        id: 8, name: "Pedro Almeida", email: "pedro.almeida@example.com", city: "Brasília, DF", experience: "10+", specializations: ["pos-cirurgico", "reabilitacao"], certifications: ["Fisioterapia Geriátrica"], availability: "this_week", rating: 4.9, reviewsCount: 55, reviews: [], bio: "Fisioterapeuta de formação, atuo como cuidador especialista em reabilitação e cuidados pós-cirúrgicos, ajudando na recuperação da mobilidade.", phone: "(61) 91234-9876", services: defaultServices, photo: "👨‍🔬", cover: { type: 'color', value: '#D1FAE5' }, verified: true, online: false, responseTime: "3 horas", completedJobs: 210, security: { backgroundCheck: 'completed', idVerification: 'completed', insurance: true },
    },
    {
        id: 9, name: "Sandra Martins", email: "sandra.martins@example.com", city: "Vitória, ES", experience: "3-5", specializations: ["companhia", "atividades-cognitivas"], certifications: [], availability: "today", rating: 4.6, reviewsCount: 18, reviews: [], bio: "Adoro conversar, jogar e fazer atividades que estimulam a memória. Sou a companhia perfeita para idosos ativos.", phone: "(27) 98765-8765", services: defaultServices, photo: "👩‍🎨", cover: { type: 'color', value: '#E0E7FF' }, verified: false, online: true, responseTime: "25 min", completedJobs: 40, security: { backgroundCheck: 'pending', idVerification: 'completed', insurance: false },
    },
    {
        id: 10, name: "Ricardo Nunes", email: "ricardo.nunes@example.com", city: "Goiânia, GO", experience: "6-10", specializations: ["parkinson", "alzheimer"], certifications: ["Terapia Ocupacional"], availability: "this_week", rating: 4.8, reviewsCount: 38, reviews: [], bio: "Terapeuta ocupacional com foco em idosos. Crio atividades adaptadas para manter a funcionalidade e a qualidade de vida.", phone: "(62) 91234-1234", services: defaultServices, photo: "👨‍💼", cover: { type: 'color', value: '#FEF3C7' }, verified: true, online: true, responseTime: "50 min", completedJobs: 130, security: { backgroundCheck: 'completed', idVerification: 'completed', insurance: true },
    },
    {
        id: 11, name: "Fernanda Rocha", email: "fernanda.rocha@example.com", city: "Cuiabá, MT", experience: "0-2", specializations: ["companhia"], certifications: ["Curso de Cuidador"], availability: "next_week", rating: 4.4, reviewsCount: 9, reviews: [], bio: "Recém-formada no curso de cuidadora, sou muito dedicada e carinhosa. Busco minha primeira oportunidade para aplicar meus conhecimentos.", phone: "(65) 98765-2345", services: defaultServices, photo: "👩‍🎓", cover: { type: 'gradient', value: 'bg-gradient-to-br from-rose-200 to-orange-200' }, verified: false, online: true, responseTime: "15 min", completedJobs: 3, security: { backgroundCheck: 'pending', idVerification: 'pending', insurance: false },
    },
    {
        id: 12, name: "Bruno Gomes", email: "bruno.gomes@example.com", city: "Campo Grande, MS", experience: "3-5", specializations: ["mobilidade-reduzida", "pos-cirurgico"], certifications: ["Primeiros Socorros"], availability: "today", rating: 4.7, reviewsCount: 25, reviews: [], bio: "Forte e cuidadoso, tenho experiência em auxiliar idosos com mobilidade reduzida e em recuperação de cirurgias. Segurança em primeiro lugar.", phone: "(67) 91234-3456", services: defaultServices, photo: "👨‍🚒", cover: { type: 'gradient', value: 'bg-gradient-to-br from-sky-200 to-cyan-200' }, verified: true, online: true, responseTime: "40 min", completedJobs: 70, security: { backgroundCheck: 'completed', idVerification: 'completed', insurance: true },
    },
    {
        id: 13, name: "Carla Dias", email: "carla.dias@example.com", city: "Belo Horizonte, MG", experience: "10+", specializations: ["diabetes", "alzheimer", "hipertensao"], certifications: ["Técnico de Enfermagem", "Gerontologia"], availability: "this_week", rating: 4.9, reviewsCount: 75, reviews: [], bio: "Com mais de 15 anos de carreira, sou técnica de enfermagem especializada em gerontologia. Experiência com casos complexos de saúde.", phone: "(31) 98765-4567", services: defaultServices, photo: "👩‍⚕️", cover: { type: 'gradient', value: 'bg-gradient-to-br from-fuchsia-200 to-purple-200' }, verified: true, online: false, responseTime: "1 hora", completedJobs: 350, security: { backgroundCheck: 'completed', idVerification: 'completed', insurance: true },
    },
    {
        id: 14, name: "Roberto Azevedo", email: "roberto.azevedo@example.com", city: "Belém, PA", experience: "6-10", specializations: ["parkinson", "companhia"], certifications: [], availability: "next_week", rating: 4.8, reviewsCount: 33, reviews: [], bio: "Paciente e bom ouvinte. Tenho 8 anos de experiência cuidando de idosos, com foco especial em pacientes com Parkinson.", phone: "(91) 91234-5678", services: defaultServices, photo: "👨‍🦳", cover: { type: 'gradient', value: 'bg-gradient-to-br from-emerald-200 to-green-200' }, verified: true, online: true, responseTime: "1h 30min", completedJobs: 115, security: { backgroundCheck: 'completed', idVerification: 'pending', insurance: false },
    },
    {
        id: 15, name: "Débora Barros", email: "debora.barros@example.com", city: "João Pessoa, PB", experience: "3-5", specializations: ["cuidados-pediatricos", "companhia"], certifications: ["Pedagogia"], availability: "today", rating: 4.9, reviewsCount: 20, reviews: [], bio: "Pedagoga de formação, tenho experiência e muito carinho no cuidado com crianças. Também atuo como companhia para idosas.", phone: "(83) 98765-6789", services: defaultServices, photo: "👩‍👧", cover: { type: 'gradient', value: 'bg-gradient-to-br from-pink-200 to-rose-200' }, verified: true, online: true, responseTime: "22 min", completedJobs: 65, security: { backgroundCheck: 'completed', idVerification: 'completed', insurance: true },
    },
    {
        id: 16, name: "Felipe Mendes", email: "felipe.mendes@example.com", city: "Curitiba, PR", experience: "6-10", specializations: ["demencia", "mobilidade-reduzida"], certifications: ["Psicologia"], availability: "this_week", rating: 4.8, reviewsCount: 45, reviews: [], bio: "Estudante de psicologia, aplico meus conhecimentos para oferecer um cuidado empático e focado no bem-estar mental de idosos com demência.", phone: "(41) 91234-7890", services: defaultServices, photo: "👨‍🎓", cover: { type: 'gradient', value: 'bg-gradient-to-br from-gray-300 to-slate-300' }, verified: true, online: false, responseTime: "4 horas", completedJobs: 180, security: { backgroundCheck: 'completed', idVerification: 'completed', insurance: true },
    },
    {
        id: 17, name: "Patrícia Ramos", email: "patricia.ramos@example.com", city: "Recife, PE", experience: "10+", specializations: ["pos-cirurgico", "curativos"], certifications: ["Enfermagem"], availability: "next_week", rating: 5.0, reviewsCount: 80, reviews: [], bio: "Enfermeira com experiência em UTI, trago a precisão e a segurança do ambiente hospitalar para o conforto do seu lar. Especialista em curativos e pós-cirúrgico.", phone: "(81) 98765-8901", services: defaultServices, photo: "👩‍⚕️", cover: { type: 'gradient', value: 'bg-gradient-to-br from-blue-200 to-cyan-200' }, verified: true, online: true, responseTime: "12 min", completedJobs: 400, security: { backgroundCheck: 'completed', idVerification: 'completed', insurance: true },
    },
    {
        id: 18, name: "Lucas Farias", email: "lucas.farias@example.com", city: "Teresina, PI", experience: "0-2", specializations: ["companhia", "tecnologia"], certifications: [], availability: "today", rating: 4.6, reviewsCount: 7, reviews: [], bio: "Jovem e dinâmico, adoro ajudar idosos com tecnologia, além de ser uma ótima companhia para conversas e passeios.", phone: "(86) 91234-9012", services: defaultServices, photo: "👨‍💻", cover: { type: 'gradient', value: 'bg-gradient-to-br from-stone-300 to-gray-300' }, verified: false, online: true, responseTime: "5 min", completedJobs: 12, security: { backgroundCheck: 'pending', idVerification: 'pending', insurance: false },
    },
    {
        id: 19, name: "Juliana Castro", email: "juliana.castro@example.com", city: "Rio de Janeiro, RJ", experience: "6-10", specializations: ["alzheimer", "atividades-cognitivas"], certifications: ["Musicoterapia"], availability: "this_week", rating: 4.9, reviewsCount: 58, reviews: [], bio: "Musicoterapeuta que utiliza a música como ferramenta para estimular a memória e trazer alegria a idosos, especialmente aqueles com Alzheimer.", phone: "(21) 98765-0123", services: defaultServices, photo: "👩‍🎤", cover: { type: 'image', value: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1931&auto=format&fit=crop' }, verified: true, online: true, responseTime: "35 min", completedJobs: 220, security: { backgroundCheck: 'completed', idVerification: 'completed', insurance: true },
    },
    {
        id: 20, name: "Gabriel Pinto", email: "gabriel.pinto@example.com", city: "Natal, RN", experience: "3-5", specializations: ["mobilidade-reduzida", "fisioterapia"], certifications: ["Educação Física"], availability: "next_week", rating: 4.7, reviewsCount: 28, reviews: [], bio: "Profissional de educação física, auxilio idosos com exercícios leves e adaptados para manter a força e a mobilidade.", phone: "(84) 91234-2345", services: defaultServices, photo: "🤸‍♂️", cover: { type: 'color', value: '#A7F3D0' }, verified: true, online: false, responseTime: "2 horas", completedJobs: 95, security: { backgroundCheck: 'completed', idVerification: 'completed', insurance: false },
    },
    {
        id: 21, name: "Vanessa Moreira", email: "vanessa.moreira@example.com", city: "Porto Alegre, RS", experience: "10+", specializations: ["cuidados-paliativos", "demencia"], certifications: ["Enfermagem", "Cuidados Paliativos"], availability: "today", rating: 5.0, reviewsCount: 65, reviews: [], bio: "Enfermeira especialista em cuidados paliativos, ofereço suporte integral ao paciente e à família em momentos delicados. Cuidado com empatia e respeito.", phone: "(51) 98765-3456", services: defaultServices, photo: "👩‍⚕️", cover: { type: 'color', value: '#BFDBFE' }, verified: true, online: true, responseTime: "18 min", completedJobs: 310, security: { backgroundCheck: 'completed', idVerification: 'completed', insurance: true },
    },
    {
        id: 22, name: "André Medeiros", email: "andre.medeiros@example.com", city: "Porto Velho, RO", experience: "6-10", specializations: ["diabetes", "hipertensao"], certifications: ["Técnico de Enfermagem"], availability: "this_week", rating: 4.8, reviewsCount: 30, reviews: [], bio: "Técnico de enfermagem com foco no controle de doenças crônicas como diabetes e hipertensão. Monitoramento e educação para a saúde.", phone: "(69) 91234-4567", services: defaultServices, photo: "👨‍⚕️", cover: { type: 'color', value: '#FDE68A' }, verified: true, online: true, responseTime: "1 hora", completedJobs: 140, security: { backgroundCheck: 'completed', idVerification: 'pending', insurance: true },
    },
    {
        id: 23, name: "Priscila Correia", email: "priscila.correia@example.com", city: "Boa Vista, RR", experience: "3-5", specializations: ["companhia", "culinaria"], certifications: [], availability: "next_week", rating: 4.7, reviewsCount: 19, reviews: [], bio: "Adoro cozinhar e conversar. Sou a companhia ideal para idosos que gostam de uma boa prosa e de refeições caseiras feitas com carinho.", phone: "(95) 98765-5678", services: defaultServices, photo: "👩‍🍳", cover: { type: 'gradient', value: 'bg-gradient-to-br from-orange-200 to-rose-200' }, verified: false, online: true, responseTime: "28 min", completedJobs: 55, security: { backgroundCheck: 'pending', idVerification: 'completed', insurance: false },
    },
    {
        id: 24, name: "Eduardo Vargas", email: "eduardo.vargas@example.com", city: "Florianópolis, SC", experience: "10+", specializations: ["reabilitacao", "pos-cirurgico"], certifications: ["Fisioterapia"], availability: "today", rating: 4.9, reviewsCount: 72, reviews: [], bio: "Fisioterapeuta com 20 anos de experiência, focado em reabilitação motora domiciliar. Ajudo pacientes a recuperarem sua independência e qualidade de vida.", phone: "(48) 91234-6789", services: defaultServices, photo: "👨‍⚕️", cover: { type: 'image', value: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=1982&auto=format&fit=crop' }, verified: true, online: true, responseTime: "10 min", completedJobs: 450, security: { backgroundCheck: 'completed', idVerification: 'completed', insurance: true },
    },
    {
        id: 25, name: "Mariana Teixeira", email: "mariana.teixeira@example.com", city: "São Paulo, SP", experience: "6-10", specializations: ["alzheimer", "demencia", "atividades-cognitivas"], certifications: ["Gerontologia", "Psicologia"], availability: "this_week", rating: 4.9, reviewsCount: 85, reviews: sampleReviews[25] || [], bio: "Psicóloga especializada em gerontologia, com foco em estimulação cognitiva para pacientes com Alzheimer e outras demências. Meu trabalho é manter a mente ativa e o coração feliz.", phone: "(11) 98765-7890", services: defaultServices, photo: "👩‍🏫", cover: { type: 'gradient', value: 'bg-gradient-to-br from-zinc-300 to-slate-300' }, verified: true, online: false, responseTime: "55 min", completedJobs: 320, security: { backgroundCheck: 'completed', idVerification: 'completed', insurance: true },
    },
    {
        id: 26, name: "Tiago Peixoto", email: "tiago.peixoto@example.com", city: "Aracaju, SE", experience: "3-5", specializations: ["companhia", "jardinagem"], certifications: [], availability: "next_week", rating: 4.7, reviewsCount: 21, reviews: [], bio: "Amante da natureza, gosto de auxiliar em atividades de jardinagem e ao ar livre. Ótima companhia para manter o corpo e a mente ativos.", phone: "(79) 91234-8901", services: defaultServices, photo: "👨‍🌾", cover: { type: 'gradient', value: 'bg-gradient-to-br from-green-300 to-lime-300' }, verified: true, online: true, responseTime: "1h 15min", completedJobs: 60, security: { backgroundCheck: 'pending', idVerification: 'completed', insurance: false },
    },
    {
        id: 27, name: "Laura Bernardes", email: "laura.bernardes@example.com", city: "Palmas, TO", experience: "6-10", specializations: ["diabetes", "hipertensao", "nutricao"], certifications: ["Nutrição"], availability: "today", rating: 4.8, reviewsCount: 36, reviews: [], bio: "Nutricionista por formação, auxilio no controle de doenças crônicas através da alimentação, preparando dietas balanceadas e saborosas.", phone: "(63) 98765-9012", services: defaultServices, photo: "👩‍🍳", cover: { type: 'gradient', value: 'bg-gradient-to-br from-amber-200 to-yellow-200' }, verified: true, online: true, responseTime: "25 min", completedJobs: 160, security: { backgroundCheck: 'completed', idVerification: 'completed', insurance: true },
    },
];

export const initialCaregivers: Caregiver[] = caregiversList.map(c => ({
    ...c,
    role: 'caregiver' as const,
    notificationPreferences: { newBookings: true, cancellations: true, newReviews: true },
    status: 'active' as const,
    vacationMode: (c as Partial<Caregiver>).vacationMode || { active: false },
    highlightedUntil: (c as Partial<Caregiver>).highlightedUntil || undefined,
    chatSettings: { autoReply: true, welcomeMessage: "Olá! Obrigado pelo contato. Estou disponível para conversar e entender suas necessidades." },
    wallet: {
        balance: 1530.00,
        pendingBalance: 450.00,
        transactions: [
            { id: 'tx-1', userId: c.id, date: new Date(Date.now() - 86400000 * 2).toISOString(), description: 'Pagamento - Carlos Andrade', amount: 153.00, type: 'credit', status: 'completed', referenceId: 'appt-3' },
            { id: 'tx-2', userId: c.id, date: new Date(Date.now() - 86400000 * 5).toISOString(), description: 'Saque Pix', amount: 500.00, type: 'debit', status: 'completed' }
        ]
    }
}) as Caregiver);

export const sampleAppointments: Appointment[] = [
    { id: 'appt-1', caregiverId: 1, caregiverName: "Netha Pereira", caregiverPhoto: "👩‍⚕️", clientId: 999, clientName: 'Carlos Andrade', clientCity: "São Luís, MA", clientPhone: "(98) 91234-5678", date: new Date().toISOString().split('T')[0], time: '09:00 - 17:00', serviceType: 'Diário', status: 'confirmed', cost: 180, paymentStatus: 'paid', paymentMethod: 'credit_card', platformFee: 27, caregiverEarnings: 153, clientCoordinates: { lat: -2.53073, lng: -44.3068 } },
    { id: 'appt-2', caregiverId: 13, caregiverName: "Carla Dias", caregiverPhoto: "👩‍⚕️", clientId: 999, clientName: 'Carlos Andrade', clientCity: "São Luís, MA", clientPhone: "(98) 91234-5678", date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0], time: '19:00 - 07:00', serviceType: 'Noturno', status: 'confirmed', cost: 200, paymentStatus: 'paid', paymentMethod: 'pix', platformFee: 30, caregiverEarnings: 170, clientCoordinates: { lat: -2.53073, lng: -44.3068 } },
    { id: 'appt-3', caregiverId: 1, caregiverName: "Netha Pereira", caregiverPhoto: "👩‍⚕️", clientId: 999, clientName: 'Carlos Andrade', clientCity: "São Luís, MA", clientPhone: "(98) 91234-5678", date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString().split('T')[0], time: '08:00 - 18:00', serviceType: 'Diário', status: 'completed', cost: 180, reviewed: false, paymentStatus: 'paid', paymentMethod: 'credit_card', platformFee: 27, caregiverEarnings: 153, clientCoordinates: { lat: -2.53073, lng: -44.3068 } },
    { id: 'appt-4', caregiverId: 25, caregiverName: "Mariana Teixeira", caregiverPhoto: "👩‍🏫", clientId: 999, clientName: 'Carlos Andrade', clientCity: "São Luís, MA", clientPhone: "(98) 91234-5678", date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0], time: '08:00 - 18:00', serviceType: '24h', status: 'confirmed', cost: 350, paymentStatus: 'paid', paymentMethod: 'credit_card', platformFee: 52.5, caregiverEarnings: 297.5, clientCoordinates: { lat: -2.53073, lng: -44.3068 } },
    { id: 'appt-5', caregiverId: 25, caregiverName: "Mariana Teixeira", caregiverPhoto: "👩‍🏫", clientId: 999, clientName: 'Carlos Andrade', clientCity: "São Luís, MA", clientPhone: "(98) 91234-5678", date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0], time: '08:00 - 18:00', serviceType: 'Diário', status: 'completed', cost: 180, reviewed: true, paymentStatus: 'paid', paymentMethod: 'pix', platformFee: 27, caregiverEarnings: 153, clientCoordinates: { lat: -2.53073, lng: -44.3068 } },
];

export const sampleNotifications: Notification[] = [
    { id: 1, type: 'booking', text: 'Novo pedido de agendamento de Família Souza.', timestamp: new Date().toISOString(), read: false },
    { id: 2, type: 'review', text: 'Você recebeu uma nova avaliação 5 estrelas!', timestamp: new Date(Date.now() - 3600 * 1000 * 24).toISOString(), read: false },
    { id: 3, type: 'message', text: 'Nova mensagem de Carlos Lima.', timestamp: new Date(Date.now() - 3600 * 1000 * 2).toISOString(), read: true },
];

export const initialConversations: Conversation[] = [
    {
        id: '1-999',
        participantIds: [1, 999],
        participantDetails: {
            1: { name: 'Netha Pereira', photo: '👩‍⚕️' },
            999: { name: 'Carlos Andrade', photo: '👨‍🦰' }
        },
        messages: [
            { id: 1, senderId: 999, text: 'Olá Netha, tudo bem? Vi seu perfil e gostaria de tirar umas dúvidas sobre o serviço noturno.', timestamp: new Date(Date.now() - 3600 * 1000 * 3).toISOString() },
            { id: 2, senderId: 1, text: 'Olá Carlos! Tudo ótimo, e com você? Claro, pode perguntar. Como posso ajudar?', timestamp: new Date(Date.now() - 3600 * 1000 * 2.5).toISOString() },
        ],
        lastMessageTimestamp: new Date(Date.now() - 3600 * 1000 * 2.5).toISOString(),
    }
];

export const initialUsers: User[] = [
    ...initialCaregivers.map(c => ({...c, password: 'password123'})),
    {
        id: 999,
        role: 'client',
        name: "Carlos Andrade",
        email: "carlos@cliente.com",
        password: "password123",
        photo: "👨‍🦰",
        city: "São Luís, MA",
        phone: "(98) 91234-5678",
        notificationPreferences: {
            bookingConfirmations: true,
            newMessages: true,
            platformUpdates: false,
        },
        status: 'active',
        wallet: {
            balance: 500.00,
            pendingBalance: 0,
            transactions: [
                { id: 'tx-c1', userId: 999, date: new Date(Date.now() - 86400000).toISOString(), description: 'Recarga de Créditos', amount: 500.00, type: 'credit', status: 'completed' }
            ]
        }
    },
    {
        id: 1000,
        role: 'admin',
        name: "Admin User",
        email: "admin@99cuidar.com",
        password: "admin123",
        photo: "👑",
        status: 'active',
    } as Admin,
];
