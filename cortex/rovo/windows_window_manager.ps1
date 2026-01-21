# Windows Window Manager for WSL
# Controls Chrome windows on Windows from WSL using PowerShell

param(
    [Parameter(Mandatory=$true)]
    [string]$Action,
    
    [int]$X,
    [int]$Y,
    [int]$Width,
    [int]$Height,
    [int]$ProcessId
)

Add-Type @"
    using System;
    using System.Runtime.InteropServices;
    
    public class Win32 {
        [DllImport("user32.dll")]
        public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
        
        [DllImport("user32.dll")]
        public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
        
        [DllImport("user32.dll")]
        public static extern bool IsIconic(IntPtr hWnd);
        
        [DllImport("user32.dll")]
        public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
        
        [StructLayout(LayoutKind.Sequential)]
        public struct RECT {
            public int Left;
            public int Top;
            public int Right;
            public int Bottom;
        }
        
        public const uint SWP_NOACTIVATE = 0x0010;
        public const uint SWP_NOZORDER = 0x0004;
        public const uint SWP_SHOWWINDOW = 0x0040;
        public const int SW_RESTORE = 9;
        public const int SW_MINIMIZE = 6;
        public const int SW_SHOW = 5;
    }
"@

function Find-ChromeWindow {
    param([int]$ProcessId)
    
    if ($ProcessId) {
        # Find specific Chrome process by PID - search parent and child processes
        # First try the exact PID
        $chrome = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -ne '' }
        if ($chrome) {
            return @{
                Handle = $chrome.MainWindowHandle
                Title = $chrome.MainWindowTitle
                ProcessId = $chrome.Id
            }
        }
        
        # Chrome uses multi-process architecture, so check all chrome processes
        # and find one that might be a child of our parent process
        $allChromeProcesses = Get-Process chrome -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -ne '' }
        
        # If only one Chrome window exists, it's likely ours (just launched)
        if ($allChromeProcesses -and $allChromeProcesses.Count -eq 1) {
            $chrome = $allChromeProcesses
            return @{
                Handle = $chrome.MainWindowHandle
                Title = $chrome.MainWindowTitle
                ProcessId = $chrome.Id
            }
        }
        
        # Try to find the newest Chrome window (most recently created)
        if ($allChromeProcesses) {
            $chrome = $allChromeProcesses | Sort-Object StartTime -Descending | Select-Object -First 1
            return @{
                Handle = $chrome.MainWindowHandle
                Title = $chrome.MainWindowTitle
                ProcessId = $chrome.Id
            }
        }
    } else {
        # Find any Chrome window (fallback)
        $chromeProcesses = Get-Process chrome -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -ne '' }
        if ($chromeProcesses) {
            $chrome = $chromeProcesses | Select-Object -First 1
            return @{
                Handle = $chrome.MainWindowHandle
                Title = $chrome.MainWindowTitle
                ProcessId = $chrome.Id
            }
        }
    }
    return $null
}

function Get-WindowGeometry {
    param([IntPtr]$Handle)
    
    $rect = New-Object Win32+RECT
    [Win32]::GetWindowRect($Handle, [ref]$rect) | Out-Null
    
    return @{
        X = $rect.Left
        Y = $rect.Top
        Width = $rect.Right - $rect.Left
        Height = $rect.Bottom - $rect.Top
    }
}

function Move-Window {
    param([IntPtr]$Handle, [int]$X, [int]$Y, [int]$Width, [int]$Height)
    
    # Restore if minimized
    if ([Win32]::IsIconic($Handle)) {
        [Win32]::ShowWindow($Handle, [Win32]::SW_RESTORE) | Out-Null
        Start-Sleep -Milliseconds 200
    }
    
    # Move and resize window
    $flags = [Win32]::SWP_NOACTIVATE -bor [Win32]::SWP_NOZORDER -bor [Win32]::SWP_SHOWWINDOW
    $result = [Win32]::SetWindowPos($Handle, [IntPtr]::Zero, $X, $Y, $Width, $Height, $flags)
    
    return $result
}

function Minimize-Window {
    param([IntPtr]$Handle)
    
    $result = [Win32]::ShowWindow($Handle, [Win32]::SW_MINIMIZE)
    return $result
}

# Main execution
switch ($Action) {
    "find" {
        $window = Find-ChromeWindow -ProcessId $ProcessId
        if ($window) {
            Write-Output "HANDLE:$($window.Handle)"
            Write-Output "TITLE:$($window.Title)"
            Write-Output "PID:$($window.ProcessId)"
        } else {
            Write-Output "ERROR:No Chrome window found"
            exit 1
        }
    }
    
    "geometry" {
        $window = Find-ChromeWindow -ProcessId $ProcessId
        $handle = $window.Handle
        
        if ($handle) {
            $geom = Get-WindowGeometry -Handle $handle
            Write-Output "X:$($geom.X)"
            Write-Output "Y:$($geom.Y)"
            Write-Output "WIDTH:$($geom.Width)"
            Write-Output "HEIGHT:$($geom.Height)"
        } else {
            Write-Output "ERROR:Window not found"
            exit 1
        }
    }
    
    "move" {
        $window = Find-ChromeWindow -ProcessId $ProcessId
        $handle = $window.Handle
        
        if ($handle) {
            $result = Move-Window -Handle $handle -X $X -Y $Y -Width $Width -Height $Height
            if ($result) {
                Write-Output "SUCCESS:Window moved to ($X, $Y) size ${Width}x${Height}"
            } else {
                Write-Output "ERROR:Failed to move window"
                exit 1
            }
        } else {
            Write-Output "ERROR:Window not found"
            exit 1
        }
    }
    
    "minimize" {
        $window = Find-ChromeWindow -ProcessId $ProcessId
        $handle = $window.Handle
        
        if ($handle) {
            $result = Minimize-Window -Handle $handle
            if ($result) {
                Write-Output "SUCCESS:Window minimized"
            } else {
                Write-Output "ERROR:Failed to minimize window"
                exit 1
            }
        } else {
            Write-Output "ERROR:Window not found"
            exit 1
        }
    }
    
    default {
        Write-Output "ERROR:Unknown action: $Action"
        Write-Output "Valid actions: find, geometry, move, minimize"
        exit 1
    }
}
