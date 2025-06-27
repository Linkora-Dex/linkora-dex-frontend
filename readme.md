# DEX Frontend - SvelteKit Application

Фронтенд приложение для децентрализованной биржи на базе SvelteKit с полным роутингом и UI компонентами.

## Установка и запуск

### 1. Создание структуры проекта

Выполните Python скрипт для создания всех необходимых файлов:



### Установка зависимостей

```bash
npm install
```

### Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:5173`

### 4. Сборка для продакшена

```bash
npm run build
npm run preview
```

## Структура проекта

```
src/
├── routes/                    # Файловый роутинг SvelteKit
│   ├── +layout.svelte        # Основной лейаут
│   ├── +page.svelte          # Главная страница (редирект)
│   ├── trade/                # Торговые страницы
│   │   ├── +page.svelte      # Редирект на ETH-PERP
│   │   └── [pair]/+page.svelte # Торговая страница
│   ├── markets/+page.svelte  # Список рынков
│   ├── portfolio/+page.svelte # Портфолио с табами
│   ├── swap/+page.svelte     # Обмен токенов
│   ├── earn/+page.svelte     # Заработок
│   ├── rewards/+page.svelte  # Награды
│   ├── settings/+page.svelte # Настройки
│   └── help/+page.svelte     # Помощь
├── lib/
│   ├── components/           # Переиспользуемые компоненты
│   │   ├── common/          # Общие компоненты
│   │   ├── trading/         # Торговые компоненты
│   │   ├── portfolio/       # Компоненты портфолио
│   │   └── ui/              # Базовые UI компоненты
│   ├── stores/              # Состояние приложения
│   ├── utils/               # Утилиты и бизнес-логика
│   └── styles/              # Глобальные стили
└── app.html                 # HTML шаблон
```

## Функциональность


#### Роутинг и навигация
- Полный файловый роутинг SvelteKit
- Навигационное меню с дропдаунами
- Мобильная версия с гамбургер меню
- Активные состояния навигации
- Автоматические редиректы

#### Страницы
- **Торговля** (`/trade/`)
  - График цены
  - Стакан ордеров
  - Форма создания ордеров
  - Последние сделки
  
- **Рынки** (`/markets`)
  - Список торговых пар
  - Фильтрация и поиск
  - Сортировка по параметрам

- **Портфолио** (`/portfolio`)
  - Табы: Позиции, Ордера, Балансы, История
  - Общая статистика портфолио
  - Кнопки депозита/вывода

- **Swap** (`/swap`)
  - Форма обмена токенов
  - Выбор токенов из дропдауна
  - Расчет комиссий и slippage

- **Остальные страницы**
  - Earn, Settings, Help

#### Компоненты
- Подключение кошелька
- Базовые UI компоненты (Button, Input, Modal, Table, Tabs)
- Торговые компоненты
- Компоненты портфолио

#### Состояние
- Wallet store для управления кошельком
- Trading store для торговых операций
- Portfolio store для данных портфолио


## Технологии

- **SvelteKit** - фреймворк
- **Tailwind CSS** - стилизация
- **Ethers.js** - взаимодействие с блокчейном
- **Web3** - дополнительная поддержка Web3
- **Axios** - HTTP клиент
- **PostCSS** - обработка CSS



## Licensing

Linkora DEX Backend uses dual licensing model

- **Open Source**: GNU Affero General Public License v3.0 (AGPL v3)
- **Commercial**: Proprietary license for commercial use

Details see in [LICENSING.md](./LICENSING.md)

### Quick License Selection

**Use AGPL v3 if**
- Your project is also open source
- Ready to share all changes
- Comply with copyleft requirements

**Need Commercial License if**
- Developing proprietary software
- Providing closed SaaS services
- Enterprise support required

**Contact**: licensing@linkora.info
