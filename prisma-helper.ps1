# PowerShell script to run Prisma commands with environment variable
$env:POSTGRES_URL="postgresql://inventory_user:GilloD%40vid1987@ep-cool-cake-a5mnbdqk.us-east-2.aws.neon.tech/inventory_system?sslmode=require"

# Functions for common Prisma commands
function Start-PrismaStudio {
    npx prisma studio
}

function Test-PrismaConnection {
    npx prisma db push --preview-feature
}

function Reset-PrismaClient {
    npx prisma generate
}

# Export functions
Export-ModuleMember -Function Start-PrismaStudio, Test-PrismaConnection, Reset-PrismaClient