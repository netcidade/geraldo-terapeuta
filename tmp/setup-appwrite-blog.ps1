$headers = @{
    'X-Appwrite-Project' = '69ce9047000365754c92'
    'X-Appwrite-Key' = 'standard_6083afdc5b1a970d094fe499227bf54885d2d2e2341a9f129a490edfdeb45dd2fc295ba76ed0cbfd3f1a86a17b603826444073b110c7d31a9d6d70e4e35893ecde7e9ecd41df4449aa04039934b3e4977b956bd14bbc5fbe2f782ebe8c0efa795385a2806b779f80260a2714dc76891bdaf9a66f53cd4af212de0c375fb10e4c'
    'Content-Type' = 'application/json'
}

Write-Host "🚀 Iniciando configuração do Appwrite via PowerShell..."

# 1. Criar Coleção
try {
    Write-Host "📂 Criando coleção 'blog'..."
    $bodyCol = @{
        collectionId = 'blog'
        name = 'blog'
        permissions = @('read("any")')
    } | ConvertTo-Json
    $resCol = Invoke-RestMethod -Method Post -Uri 'https://nyc.cloud.appwrite.io/v1/databases/69ce90680013f47be034/collections' -Headers $headers -Body $bodyCol
    Write-Host "✅ Coleção 'blog' criada!"
} catch {
    Write-Host "⚠️ Coleção 'blog' já existe ou ocorreu um erro: $($_.Exception.Message)"
}

# Aguardar sincronização
Start-Sleep -Seconds 2

# 2. Criar Atributo SLUG
try {
    Write-Host "🏷️ Criando atributo 'slug'..."
    $bodySlug = @{
        key = 'slug'
        size = 255
        required = $true
    } | ConvertTo-Json
    Invoke-RestMethod -Method Post -Uri 'https://nyc.cloud.appwrite.io/v1/databases/69ce90680013f47be034/collections/blog/attributes/string' -Headers $headers -Body $bodySlug
    Write-Host "✅ Atributo 'slug' criado!"
} catch {
    Write-Host "⚠️ Atributo 'slug' já existe ou erro: $($_.Exception.Message)"
}

# 3. Criar Atributo DATA
try {
    Write-Host "🏷️ Criando atributo 'data'..."
    $bodyData = @{
        key = 'data'
        size = 15000
        required = $true
    } | ConvertTo-Json
    Invoke-RestMethod -Method Post -Uri 'https://nyc.cloud.appwrite.io/v1/databases/69ce90680013f47be034/collections/blog/attributes/string' -Headers $headers -Body $bodyData
    Write-Host "✅ Atributo 'data' criado!"
} catch {
    Write-Host "⚠️ Atributo 'data' já existe ou erro: $($_.Exception.Message)"
}

Write-Host "✨ Configuração concluída! O blog está pronto para ser usado."
