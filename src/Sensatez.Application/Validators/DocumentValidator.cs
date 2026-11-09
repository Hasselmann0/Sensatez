namespace Sensatez.Application.Validators;

public static class DocumentValidator
{
    public static bool IsValidCpfOrCnpj(string? document)
    {
        if (string.IsNullOrWhiteSpace(document))
            return false;

        if (!document.All(char.IsDigit))
            return false;

        return document.Length switch
        {
            11 => IsValidCpf(document),
            14 => IsValidCnpj(document),
            _ => false
        };
    }

    public static bool IsValidCpf(string cpf)
    {
        if (cpf.Length != 11 || cpf.Distinct().Count() == 1)
            return false;

        var sum1 = 0;
        for (var i = 0; i < 9; i++)
            sum1 += (cpf[i] - '0') * (10 - i);

        var remainder1 = sum1 % 11;
        var digit1 = remainder1 < 2 ? 0 : 11 - remainder1;
        if (cpf[9] - '0' != digit1)
            return false;

        var sum2 = 0;
        for (var i = 0; i < 10; i++)
            sum2 += (cpf[i] - '0') * (11 - i);

        var remainder2 = sum2 % 11;
        var digit2 = remainder2 < 2 ? 0 : 11 - remainder2;
        return cpf[10] - '0' == digit2;
    }

    public static bool IsValidCnpj(string cnpj)
    {
        if (cnpj.Length != 14 || cnpj.Distinct().Count() == 1)
            return false;

        ReadOnlySpan<int> weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        var sum1 = 0;
        for (var i = 0; i < 12; i++)
            sum1 += (cnpj[i] - '0') * weights1[i];

        var remainder1 = sum1 % 11;
        var digit1 = remainder1 < 2 ? 0 : 11 - remainder1;
        if (cnpj[12] - '0' != digit1)
            return false;

        ReadOnlySpan<int> weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        var sum2 = 0;
        for (var i = 0; i < 13; i++)
            sum2 += (cnpj[i] - '0') * weights2[i];

        var remainder2 = sum2 % 11;
        var digit2 = remainder2 < 2 ? 0 : 11 - remainder2;
        return cnpj[13] - '0' == digit2;
    }
}

