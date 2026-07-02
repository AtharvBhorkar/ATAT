const mockBookings = [
    {
        id: 'BK001234',
        customer: 'John Doe',
        vehicle: '2023 Toyota Fortuner',
        checkIn: '2025-01-15',
        checkOut: '2025-01-18',
        amount: 8500,
        paid: 8500,
        status: 'confirmed'
    },
    {
        id: 'BK001235',
        customer: 'Jane Smith',
        vehicle: '2022 Hyundai Creta',
        checkIn: '2025-01-16',
        checkOut: '2025-01-19',
        amount: 6200,
        paid: 3100,
        status: 'pending'
    },
    {
        id: 'BK001236',
        customer: 'Raj Kumar',
        vehicle: '2024 Maruti Swift',
        checkIn: '2025-01-10',
        checkOut: '2025-01-13',
        amount: 4500,
        paid: 4500,
        status: 'completed'
    },
    {
        id: 'BK001237',
        customer: 'Priya Singh',
        vehicle: '2023 Honda City',
        checkIn: '2025-01-12',
        checkOut: '2025-01-14',
        amount: 5200,
        paid: 0,
        status: 'cancelled'
    },
    {
        id: 'BK001238',
        customer: 'Amit Patel',
        vehicle: '2024 Kia Sonet',
        checkIn: '2025-01-20',
        checkOut: '2025-01-23',
        amount: 7800,
        paid: 7800,
        status: 'confirmed'
    },
    {
        id: 'BK001239',
        customer: 'Vikram Singh',
        vehicle: '2023 Tata Harrier',
        checkIn: '2025-01-14',
        checkOut: '2025-01-17',
        amount: 9200,
        paid: 4600,
        status: 'pending'
    }
];

const mockVehicles = [
    {
        id: 'VH001',
        name: '2023 Toyota Fortuner',
        type: 'suv',
        dailyRate: 2800,
        mileage: 15000,
        year: 2023,
        status: 'available',
        image: '🚙'
    },
    {
        id: 'VH002',
        name: '2022 Hyundai Creta',
        type: 'suv',
        dailyRate: 2200,
        mileage: 32000,
        year: 2022,
        status: 'rented',
        image: '🚙'
    },
    {
        id: 'VH003',
        name: '2024 Maruti Swift',
        type: 'sedan',
        dailyRate: 1500,
        mileage: 5000,
        year: 2024,
        status: 'available',
        image: '🚗'
    },
    {
        id: 'VH004',
        name: '2023 Honda City',
        type: 'sedan',
        dailyRate: 1800,
        mileage: 22000,
        year: 2023,
        status: 'maintenance',
        image: '🚗'
    },
    {
        id: 'VH005',
        name: '2024 Kia Sonet',
        type: 'suv',
        dailyRate: 2100,
        mileage: 8000,
        year: 2024,
        status: 'available',
        image: '🚙'
    },
    {
        id: 'VH006',
        name: '2023 Tata Harrier',
        type: 'suv',
        dailyRate: 2600,
        mileage: 28000,
        year: 2023,
        status: 'rented',
        image: '🚙'
    },
    {
        id: 'VH007',
        name: '2024 Mahindra XUV700',
        type: 'luxury',
        dailyRate: 3500,
        mileage: 3000,
        year: 2024,
        status: 'available',
        image: '🚙'
    },
    {
        id: 'VH008',
        name: '2023 Innova Crysta',
        type: 'van',
        dailyRate: 2400,
        mileage: 35000,
        year: 2023,
        status: 'available',
        image: '🚐'
    }
];

const chartColors = {
    primary: 'rgb(110, 31, 43)',
    secondary: 'rgb(217, 164, 65)',
    success: 'rgb(74, 124, 89)',
    danger: 'rgb(211, 47, 47)',
    warning: 'rgb(255, 122, 0)',
    info: 'rgb(25, 118, 210)'
};

const bookingsChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
        {
            label: 'Confirmed Bookings',
            data: [45, 52, 48, 61, 55, 67, 72, 68, 74, 79, 85, 92],
            borderColor: chartColors.primary,
            backgroundColor: 'rgba(110, 31, 43, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
        },
        {
            label: 'Cancellations',
            data: [5, 4, 6, 3, 7, 2, 3, 5, 2, 4, 3, 2],
            borderColor: chartColors.danger,
            backgroundColor: 'rgba(211, 47, 47, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
        }
    ]
};

const paymentChartData = {
    labels: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Cash'],
    datasets: [{
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
            chartColors.primary,
            chartColors.secondary,
            chartColors.success,
            chartColors.info,
            chartColors.warning
        ],
        borderColor: '#fff',
        borderWidth: 2
    }]
};

const mockPackages = [
    {
        id: 'PKG001',
        name: 'Kerala Backwaters Tour',
        duration: '5 Days',
        price: 18500,
        vehicles: 12,
        bookings: 45,
        status: 'active'
    },
    {
        id: 'PKG002',
        name: 'Rajasthan Heritage',
        duration: '7 Days',
        price: 28000,
        vehicles: 8,
        bookings: 32,
        status: 'active'
    },
    {
        id: 'PKG003',
        name: 'Himalayan Adventure',
        duration: '10 Days',
        price: 42500,
        vehicles: 15,
        bookings: 28,
        status: 'active'
    },
    {
        id: 'PKG004',
        name: 'Goa Beach Getaway',
        duration: '3 Days',
        price: 12000,
        vehicles: 10,
        bookings: 67,
        status: 'inactive'
    }
];

const mockUsers = [
    {
        id: 'USR001',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@email.com',
        phone: '+91-9876543210',
        registered: '2024-01-15',
        bookings: 8,
        spent: 52000,
        status: 'active'
    },
    {
        id: 'USR002',
        name: 'Priya Mehta',
        email: 'priya.mehta@email.com',
        phone: '+91-9123456789',
        registered: '2025-01-20',
        bookings: 1,
        spent: 8500,
        status: 'new'
    },
    {
        id: 'USR003',
        name: 'Amit Malhotra',
        email: 'amit.malhotra@email.com',
        phone: '+91-9999888877',
        registered: '2024-06-10',
        bookings: 5,
        spent: 35200,
        status: 'active'
    },
    {
        id: 'USR004',
        name: 'Neha Singh',
        email: 'neha.singh@email.com',
        phone: '+91-9555666777',
        registered: '2023-11-05',
        bookings: 12,
        spent: 78500,
        status: 'active'
    },
    {
        id: 'USR005',
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@email.com',
        phone: '+91-8765432109',
        registered: '2024-08-22',
        bookings: 0,
        spent: 0,
        status: 'inactive'
    }
];

const mockPayments = [
    {
        id: 'PAY501',
        bookingId: 'BK001234',
        customer: 'Rahul Sharma',
        amount: 8500,
        method: 'UPI',
        date: '2025-01-18',
        status: 'paid'
    },
    {
        id: 'PAY502',
        bookingId: 'BK001235',
        customer: 'Amit Malhotra',
        amount: 22500,
        method: 'Card',
        date: '2025-01-17',
        status: 'failed'
    },
    {
        id: 'PAY503',
        bookingId: 'BK001236',
        customer: 'Jane Smith',
        amount: 15200,
        method: 'Net Banking',
        date: '2025-01-16',
        status: 'paid'
    },
    {
        id: 'PAY504',
        bookingId: 'BK001237',
        customer: 'Priya Singh',
        amount: 5200,
        method: 'Cash',
        date: '2025-01-15',
        status: 'pending'
    },
    {
        id: 'PAY505',
        bookingId: 'BK001238',
        customer: 'Vikram Singh',
        amount: 9200,
        method: 'UPI',
        date: '2025-01-14',
        status: 'paid'
    }
];

const mockActiveRentals = [
    {
        id: 'BK789456',
        vehicle: '2023 Toyota Fortuner',
        customer: 'John Doe',
        driver: 'Rajesh Verma',
        startDate: '2025-01-15',
        endDate: '2025-01-18',
        progress: 60
    },
    {
        id: 'BK789457',
        vehicle: '2024 Maruti Swift',
        customer: 'Sarah Williams',
        driver: 'Amit Kumar',
        startDate: '2025-01-16',
        endDate: '2025-01-19',
        progress: 45
    },
    {
        id: 'BK789458',
        vehicle: '2023 Honda City',
        customer: 'Michael Brown',
        driver: 'Suresh Singh',
        startDate: '2025-01-14',
        endDate: '2025-01-17',
        progress: 75
    }
];