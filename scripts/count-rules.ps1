$content = Get-Content -Raw -Encoding UTF8 'd:\VibeCoding\数据结构学习助手3\.trae\rules\project_rules.md'
$chinese = ([regex]::Matches($content, '[一-鿿]')).Count
$total = $content.Length
$lines = (Get-Content 'd:\VibeCoding\数据结构学习助手3\.trae\rules\project_rules.md' | Measure-Object -Line).Lines
Write-Host ('Chinese chars: ' + $chinese)
Write-Host ('Total chars: ' + $total)
Write-Host ('Lines: ' + $lines)
