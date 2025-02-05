!macro customHeader
  !define MUI_DIRECTORYPAGE_TEXT_TOP "Seleccione la carpeta de destino para instalar ${PRODUCT_NAME}."
!macroend

!macro customInit
  SetRegView 64
  StrCpy $INSTDIR "$PROGRAMFILES64\${PRODUCT_NAME}"
!macroend
