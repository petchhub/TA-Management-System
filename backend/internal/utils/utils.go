package utils

import (
	cryptoRand "crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
	"unicode"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type AppClaims struct {
	Sub   string `json:"sub"`
	Email string `json:"email"`
	Name  string `json:"name"`
	Role  string `json:"role"`
	jwt.RegisteredClaims
}

func GetenvDefault(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}

func SetStateCookie(w http.ResponseWriter, state string) {
	c := &http.Cookie{
		Name:     "oauth_state",
		Value:    state,
		Path:     "/",
		HttpOnly: true,
		Secure:   false, // set true behind HTTPS in prod
		SameSite: http.SameSiteLaxMode,
		MaxAge:   300, // 5 minutes
	}

	http.SetCookie(w, c)
}

// ====== Helpers ======
func RandState(n int) (string, error) {
	b := make([]byte, n)
	if _, err := cryptoRand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

func DecodeToken(tokenString string, jwtSecret []byte) (*AppClaims, error) {
	claims := &AppClaims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method %v", token.Method.Alg())
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("token is valid")
	}

	if claims, ok := token.Claims.(*AppClaims); ok {
		return claims, nil
	}
	return nil, errors.New("could not assert claims type")
}

func ValidateParam(ctx *gin.Context, paramName string) (int, bool) {
	paramValue := ctx.Param(paramName)
	if paramValue == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": paramName + "is required"})
		return 0, false
	}

	id, err := strconv.Atoi(paramValue)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": paramName + "must be a valid integer"})
	}

	return id, true
}

func ExtractDigits(s string) (int, bool) {
	var sb strings.Builder
	for _, r := range s {
		if unicode.IsDigit(r) {
			sb.WriteRune(r)
		}
	}

	number, err := strconv.Atoi(sb.String())
	if err != nil {
		fmt.Printf("Failed to Extractdigits : %v\n", err)
		return 0, false
	}
	return number, true
}

func GetFileData(ctx *gin.Context, key string) (string, *[]byte, error) {

	fileHeader, err := ctx.FormFile(key)
	if err != nil {
		fmt.Println(err)
		return "", nil, fmt.Errorf("file is required.")
	}

	file, err := fileHeader.Open()
	if err != nil {
		fmt.Println(err)
		return "", nil, fmt.Errorf("failed to open file.")
	}
	defer file.Close()

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		fmt.Println(err)
		return "", nil, fmt.Errorf("failed to read file.")
	}

	return fileHeader.Filename, &fileBytes, nil
}

func IsDigitOnly(s string) bool {
	for _, c := range s {
		if !unicode.IsDigit(c) {
			return false
		}
	}
	return s != ""
}

func GetThaiMonthName(month int) string {
	months := map[int]string{
		1:  "มกราคม",
		2:  "กุมภาพันธ์",
		3:  "มีนาคม",
		4:  "เมษายน",
		5:  "พฤษภาคม",
		6:  "มิถุนายน",
		7:  "กรกฎาคม",
		8:  "สิงหาคม",
		9:  "กันยายน",
		10: "ตุลาคม",
		11: "พฤศจิกายน",
		12: "ธันวาคม",
	}
	return months[month]
}

func ThaiBahtText(amount int) string {
	if amount == 0 {
		return "ศูนย์บาทถ้วน"
	}

	units := []string{"", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"}
	nums := []string{"ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"}

	var result strings.Builder
	strNum := fmt.Sprintf("%d", amount)
	n := len(strNum)

	for i := 0; i < n; i++ {
		digit := int(strNum[i] - '0')
		pos := n - i - 1

		if digit != 0 {
			// Rule 2: 20 is "ยี่สิบ"
			if pos%6 == 1 && digit == 2 {
				result.WriteString("ยี่")
			} else if pos%6 == 1 && digit == 1 {
				// Rule 1: 10 is "สิบ" (skip "หนึ่ง")
			} else if pos%6 == 0 && digit == 1 && i > 0 && int(strNum[i-1]-'0') != 0 {
				// Rule 3: 1 at the end is "เอ็ด"
				result.WriteString("เอ็ด")
			} else {
				result.WriteString(nums[digit])
			}

			// Add the unit (Ten, Hundred, etc.)
			result.WriteString(units[pos%6])
		}

		// Handle Millions (reset for numbers > 1,000,000)
		if pos != 0 && pos%6 == 0 {
			result.WriteString("ล้าน")
		}
	}

	result.WriteString("บาทถ้วน")
	return result.String()
}
