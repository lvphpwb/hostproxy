#NoTrayIcon
#include <Constants.au3> ;
#include <Process.au3> ;

Opt("TrayMenuMode", 3)
Local $runitem    = TrayCreateItem("运行")
TrayCreateItem("")
Local $stopitem    = TrayCreateItem("关闭")
TrayCreateItem("")
Local $exititem = TrayCreateItem("退出")


Local $PID = ""
TraySetState(1)

While 1
   Local $msg = TrayGetMsg()
   Select
	  Case $msg = 0
		 ContinueLoop
	  Case $msg = $runitem
		 If $PID>0 Then 
			
		 Else
			$PID = Run("node.exe index.js", "", @SW_HIDE)
			TrayItemSetState($stopitem, $TRAY_UNCHECKED)
			TrayItemSetState($runitem, $TRAY_CHECKED)
			If $PID Then MsgBox(64, "启动:", "启动成功!")
		 EndIf
	  Case $msg = $stopitem
		 If $PID>0 Then 
			ProcessClose($PID)
			$PID = 0
			TrayItemSetState($runitem,$TRAY_UNCHECKED)
			TrayItemSetState($stopitem,$TRAY_CHECKED)
			MsgBox(64, "关闭:", "关闭成功!")
		 Else
		 
		 EndIf
	  Case $msg = $exititem
		 If $PID Then ProcessClose($PID)
		 MsgBox(64, "退出:", "退出成功!")
		 ExitLoop
   EndSelect
WEnd

Exit